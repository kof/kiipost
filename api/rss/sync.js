'use strict'

var FeedParser = require('feedparser')
var request = require('request')
var _ = require('underscore')
var _s = require('underscore.string')
var m = require('mongoose')
var moment = require('moment')
var thunkify = require('thunkify')
var co = require('co')
var extend = require('extend')

var conf = require('api/conf')
var contentAnalysis = require('api/yahoo/contentAnalysis')
var extractor = require('api/extractor')
var CharsetConverter = require('api/extractor/CharsetConverter')
var batchInsert = require('api/db/batchInsert')
var error = require('api/error')
var filterTags = require('api/tags/filter')
var ProcessingController = require('api/processing-controller')

var PARALLEL = 50
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

/**
 * Process all feeds from the feeds collection.
 *
 * Options:
 *   - `maxParallel` max amount of feeds to process in parallel
 *   - `feed` only this specific feed
 *   - `feeds` array of feeds
 *   - `update` update existing posts, defaults to false
 *
 * @param {Object} [options]
 */
module.exports = thunkify(function(options, callback) {
    options = extend({
        maxParallel: 200,
        update: false,
        feed: null,
        feeds: null
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
        .lean()
        .limit(options.limit)
        .stream()

    var errors = []
    var processing = 0
    var closed = false
    var controller = new ProcessingController().start()

    controller.addMetric('parallel', function() {
        return function() {
            return {
                value: processing,
                ok: processing < options.maxParallel
            }
        }
    })

    feeds.on('data', function(data) {
        if (options.verbose) console.log(controller.stats)
        if (controller.check()) {
            onData(data)
        } else {
            console.log('controller not ok', controller.stats)
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

    function onData(feed) {
        if (options.verbose) console.log(feed.feed)

        processing++
        processOne(feed, options, function(err, _errors) {
            var update

            if (err) {
                update = {$inc: {failsCounter: 1}}
                errors.push(err)
            } else {
                update = {$set: {failsCounter: 0, lastSync: new Date()}}
            }

            m.model('rssfeed')
                .update({_id: feed._id}, update)
                .exec(function(err) {
                    if (err) errors.push(err)
                    errors = error.uniq(errors.concat(_errors))
                    processing--
                    complete()
                })
        })
    }

    function complete() {
        if (processing > 0 || !closed) return
        controller.stop()
        callback(null, error.uniq(errors))
    }
})

/**
 * Save the posts from 1 feed to the db.
 *
 * @param {Object} feed
 * @param {Object} options
 */
function processOne(feed, options, callback) {
    co(function *(){
        var err, errors = []
        try {
            var articles = yield fetch(feed.feed)
            articles = prenormalize(articles)
            articles = yield prefilter(articles, options)
            errors = errors.concat(yield addSiteData(articles))
            errors = errors.concat(yield addAnalyzedTags(articles))
            articles = postfilter(articles)
            articles = postnormalize(articles, feed)
            yield save(articles, options)
        } catch(_err) {
            err = _err
            err.feed = feed
            if (!err.level && IGNORE_ERRORS.test(err.message)) err.level = 'trace'
        }

        callback(err, errors)
    })()
}

/**
 * Fetch the rss feed, parse and normalize it to json.
 *
 * @param {String} url
 * @param {Function} callback
 */
function fetch(url, callback) {
    var req

    // Bad uri emits before error handler is attached.
    try {
        req = request(url, {timeout: conf.request.timeout, pool: false})
    } catch(err) {
        return setImmediate(callback, err)
    }

    req.setMaxListeners(50)
    req
        // Some feeds do not response without user-agent and accept headers.
        .setHeader('user-agent', conf.request.userAgent)
        .setHeader('accept', conf.request.accept)
        .on('error', callback)
        .on('response', function(res) {
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'))

            var converter = new CharsetConverter(req, res)
            var articles = []
            var feedParser = new FeedParser()

            req
                .pipe(converter.getStream())
                .on('error', callback)
                .pipe(feedParser)

            feedParser
                .on('error', callback)
                .on('readable', function() {
                    var article, exit = false

                    while (!exit && (article = this.read())) {
                        if (articles.length < MAX_ITEMS) {
                            articles.push(article)
                        } else {
                            exit = true
                            req.req.abort()
                        }
                    }
                })
                .on('end', function() {
                    callback(null, articles)
                })
        })
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
                err.article = article
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
function prenormalize(articles) {
    return articles.map(function(article) {
        var normalized = {}

        // When FeedBurner or Pheedo puts a special tracking url
        // in the link property, origlink contains the original link.
        normalized.url = article.origlink || article.link
        normalized.pubDate = article.pubDate ? new Date(article.pubDate) : new Date()
        normalized.title = article.title
        normalized.summary = _s.prune(_s.stripTags(article.summary), 250, '')
        normalized.description = article.description
        normalized.categories = _.uniq(_.compact(article.categories))
        // Make categories to tags so that article can be found by a category.
        normalized.tags = normalized.categories.map(function(cat) {
            return cat.toLowerCase().trim()
        })
        normalized.enclosures = _.compact(article.enclosures)

        return normalized
    })
}

function postnormalize(articles, feed) {
    return articles.map(function(article) {
        article.tags = _.invoke(article.tags, 'toLowerCase')
        article.tags = _.uniq(article.tags)
        article.tags = _.compact(article.tags)
        article.tags = article.tags.filter(filterTags)
        article.feedId = feed._id
        return article
    })
}

/**
 * Extract data from the site, extend the article.
 */
function addSiteData(articles, callback) {
    return function* () {
        var errors = []

        if (!articles.length) return errors
        for (var i = 0; i < articles.length; i++) {
            try {
                var article = articles[i]
                var data = yield extractor.extract(article.url)
                var tags = article.tags
                extend(article, data)
                // Merge tags, don't overwrite.
                article.tags = tags.concat(data.tags)
            } catch(err) {
                err.article = article
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
            articles.forEach(function(article) {
                co(function* () {
                    yield m.model('article')
                        .update({url: article.url}, {$set: article}, {upsert: true})
                        .exec()
                })()
            })
        } else {
            yield batchInsert('article', articles)
        }
    }
}
