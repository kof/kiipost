'use strict'

var FeedParser = require('feedparser')
var request = require('superagent')
var _ = require('underscore')
var _s = require('underscore.string')
var m = require('mongoose')
var moment = require('moment')
var thunkify = require('thunkify')
var co = require('co')
var extend = require('extend')
var url = require('url')

var conf = require('api/conf')
var contentAnalysis = require('api/yahoo/contentAnalysis')
var extractor = require('api/extractor')
var convertCharset = require('api/extractor/convertCharset')
var bufferParser = require('api/extractor/bufferParser')
var batchInsert = require('api/db/batchInsert')
var error = require('api/error')
var filterTags = require('api/tags/filter')
var ProcessingController = require('api/processing-controller')

// Posts should be not older than this date.
var MIN_PUB_DATE = moment().subtract('days', conf.article.maxAge).toDate()
// Reduce damage from spammy feeds.
var MAX_ITEMS = 200

var IGNORE_ERRORS

IGNORE_ERRORS = new RegExp([
    'EHOSTUNREACH',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'ESOCKETTIMEDOUT',
    'EADDRINFO',
    'Unexpected end',
    'Bad status code',
    'socket hang up',
    'Not a feed',
    'Exceeded maxRedirects',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    // Http parser can throw, known case https://github.com/joyent/node/issues/4863
    'Parse Error'
].join('|'), 'i')

var ExtError = error.ExtError

var noop = function() {}

/**
 * Process all feeds from the feeds collection.
 *
 * Options:
 *   - `parallel` max amount of feeds to process in parallel
 *   - `feed` only this specific feed
 *   - `update` update existing posts, defaults to false
 *   - `query` query of mongo instead of feed
 *   - `skip` skip of mongo
 *
 * @param {Object} [options]
 */
module.exports = thunkify(function(options, callback) {
    options = extend({
        parallel: 100,
        update: false,
        feed: null,
        feeds: null,
        memory: null
    }, options)

    var query
    if (options.query) {
        query = options.query
    } else if (options.feed) {
        query = {feed: options.feed}
    }

    var feeds
    feeds = m.model('rssfeed')
        .find(query)
        .select({_id: 1, feed: 1})
        .sort({'syncStats.date': 1})
        .lean()
        .limit(options.limit)
        .skip(options.skip)
        .stream()

    var errors = []
    var processing = 0
    var processed = 0
    var closed = false

    var controller = new ProcessingController({mem: {max: options.memory}})

    controller.addMetric('parallel', function() {
        return function() {
            return {
                ok: processing < options.parallel,
                value: processing
            }
        }
    })

    controller.once('tooLongNok', function() {
        feeds.emit('close')
    }).start()

    var onData

    feeds.on('data', function(data) {
        if (options.verbose) console.log(controller.stats)

        if (controller.check()) {
            onData(data)
        } else {
            feeds.pause()
            controller.once('ok', function() {
                onData(data)
                feeds.resume()
            })
        }
    })

    feeds.on('error', function(err) {
        errors.push(err)
    })

    feeds.on('close', function() {
        closed = true
        complete()
    })

    onData = co(function* (feed) {
        if (options.verbose) console.log(feed.feed)
        processing++
        var start = Date.now()
        var update
        var stats

        try {
            stats = yield processOne(feed, options)
            update = {$set: {
                syncStats: {
                    duration: Date.now() - start,
                    errors: stats.errors.length,
                    articlesOk: stats.ok,
                    articlesTotal: stats.total,
                    failed: 0,
                    date: new Date()
                }
            }}
            if (options.verbose && stats.errors.length) console.log(stats.errors)
            errors = errors.concat(stats.errors)
        } catch(err) {
            update = {
                $inc: {'syncStats.failed': 1},
                $set: {'syncStats.date': new Date()}
            }
            errors.push(err)
        }

        yield m.model('rssfeed')
            .update({_id: feed._id}, update)
            .exec()

        processing--
        processed++
        complete()
    })

    function complete() {
        if (processing > 0 || !closed) return
        controller.stop()
        errors = error.uniq(errors, [/Unexpected end/])
        callback(null, {errors: errors, processed: processed})
    }
})

/**
 * Save the posts from 1 feed to the db.
 *
 * @param {Object} feed
 * @param {Object} options
 */
function* processOne (feed, options) {
    var stats = {errors: []}

    try {
        var articles = yield fetch(feed.feed)
        stats.total = articles.length
        articles = prenormalize(articles, feed.feed)
        articles = yield prefilter(articles, options)
        stats.errors = stats.errors.concat(yield addSiteData(articles))
        stats.errors = stats.errors.concat(yield addAnalyzedTags(articles))
        articles = postnormalize(articles, feed)
        articles = postfilter(articles)
        stats.ok = articles.length
        yield save(articles, options)
    } catch(err) {
        err.feed = feed
        if (!err.level && IGNORE_ERRORS.test(err.message)) err.level = 'trace'
        throw err
    }

    return stats
}

/**
 * Fetch the rss feed, parse and normalize it to json.
 *
 * @param {String} url
 * @param {Function} callback
 */
function fetch(url, callback) {
    var req, done
    var timeoutId

    done = _.once(callback)

    req = request
        .get(url)
        .set('user-agent', conf.request.agent)
        .set('accept', conf.request.accept)
        .timeout(conf.request.timeout)
        .parse(bufferParser({
            type: /xml/i,
            maxLength: 1000 * 1024
        }))
        .agent(undefined)
        .buffer(true)
        .on('error', done)
        .end(function(res) {
            if (!res.ok) return done(new ExtError('Bad status code', {statusCode: res.statusCode}))

            var data = convertCharset(res, res.body)
            var articles = []

            new FeedParser({feedurl: req.url})
                .on('error', done)
                .on('readable', function() {
                    var article, exit = false
                    while (!exit && (article = this.read())) {
                        if (articles.length < MAX_ITEMS) {
                            articles.push(article)
                        } else {
                            exit = true
                        }
                    }
                })
                .on('end', function() {
                    clearTimeout(timeoutId)
                    done(null, articles)
                })
                .end(data)
        })

    // Required because in case of redirect and then not emiting end
    // timeout of superagent will not work
    // https://github.com/visionmedia/superagent/issues/413
    timeoutId = setTimeout(function() {
        done(new Error('Feed parse timeout'))
    }, conf.request.timeout + 10000)
}

fetch = thunkify(fetch)

/**
 * Find tags by analyzing description.
 */
function addAnalyzedTags(articles) {
    return function* () {
        var errors = []

        if (!articles.length) return errors
        for (var i = 0; i < articles.length; i++) {
            try {
                var article = articles[i]
                var text = _s.stripTags(article.description).trim()
                var data = yield contentAnalysis.analyze({text: text})
                if (!data) continue
                var tags = _.pluck(data.entities.concat(data.categories), 'content')
                article.tags = article.tags.concat(tags)
            } catch(err) {
                err.type = 'CONTENT_ANALYSIS'
                err.text = text
                err.articleUrl = article.url
                errors.push(err)
            }
        }

        return errors
    }
}

/**
 * Filter out articles without links or those once we have already synced.
 */
function prefilter(articles, options) {
    return function* () {
        var currArticles, urlsMap = {}

        // All articles need to be resynced.
        if (!options.update) {
            currArticles = yield m.model('article')
                .find({url: {$in: _.pluck(articles, 'url')}})
                .select({url: 1})
                .lean()
                .exec()

            urlsMap = _.groupBy(currArticles, function(article) {
                return article.url
            })
        }

        return articles.filter(function(article) {
            // Has no link - we can't link to it
            if (!article.url) return false
            // We have it already.
            if (urlsMap[article.url]) return false
            // Too old.
            if (article.pubDate.getTime() < MIN_PUB_DATE.getTime()) return false
            // Is in the future.
            if (article.pubDate.getTime() > Date.now()) return false

            return true
        })
    }
}

/**
 * Filter out articles don't fit our criteria.
 */
function postfilter(articles) {
    return articles.filter(function(article) {
        // Has no tags - we can't find it.
        if (_.isEmpty(article.tags)) return false
        // Has no title - we can't list it.
        if (!article.title) return false

        return true
    })
}

/**
 * Normalize an article to our format.
 */
function prenormalize(articles, feedUrl) {
    return articles.map(function(article) {
        var normalized = {}
        // When FeedBurner or Pheedo puts a special tracking url
        // in the link property, origlink contains the original link.
        normalized.url = article.origlink || article.link
        if (normalized.url && !url.parse(normalized.url).host) {
            normalized.url = url.resolve(feedUrl, normalized.url)
        }
        normalized.pubDate = article.pubDate ? new Date(article.pubDate) : new Date()
        normalized.title = article.title
        normalized.summary = _s.prune(_s.stripTags(article.summary).trim(), 250, '')
        normalized.description = article.description
        normalized.categories = _.uniq(_.compact(article.categories))
        // Make categories to tags so that article can be found by a category.
        normalized.tags = normalized.categories
        normalized.enclosures = _.compact(article.enclosures)
        return normalized
    })
}

function postnormalize(articles, feed) {
    return articles.map(function(article) {
        article.tags = article.tags.map(function(tag) {
            return tag && String(tag).trim().toLowerCase()
        })
        article.tags = _.compact(_.uniq(article.tags)).filter(filterTags)
        article.feedId = feed._id
        return article
    })
}

/**
 * Extract data from the site, extend the article.
 */
function addSiteData(articles) {

    function len(str) {
        return str && str.length ? str.length : 0
    }

    return function* () {
        var errors = []

        if (!articles.length) return errors
        for (var i = 0; i < articles.length; i++) {
            try {
                var article = articles[i]
                var data = yield extractor.extract(article.url)
                if (len(data.title) > len(article.title)) {
                    article.title = data.title
                }
                article.score = data.score
                article.url = data.url
                if (data.icon) article.icon = data.icon
                article.images = data.images
                if (len(data.summary) > len(article.summary)) {
                    article.summary = data.summary
                }
                if (len(data.description) > len(article.description)) {
                    article.description = data.description
                }
                article.tags = article.tags.concat(data.tags)
            } catch(err) {
                err.type = 'EXTRACTOR'
                err.articleUrl = article.url
                errors.push(err)
            }
        }

        return errors
    }
}

/**
 * Make a batch insert or update each article.
 */
function save(articles, options) {
    return function* () {
        if (options.update) {
            var errors = []
            articles.forEach(co(function* (article) {
                try {
                    yield m.model('article')
                        .update({url: article.url}, {$set: article}, {upsert: true})
                        .exec()
                } catch(err) {
                    errors.push(err)
                }
            }))
            if (errors.length) throw new error.ExtError('Articles update', errors)
        } else {
            yield batchInsert('article', articles)
        }
    }
}
