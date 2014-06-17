'use strict'

var FeedParser = require('feedparser')
var request = require('request')
var _ = require('underscore')
var _s = require('underscore.string')
var m = require('mongoose')
var moment = require('moment')
var Batch = require('batch')
var retry = require('retry')
var thunkify = require('thunkify')
var co = require('co')

var conf = require('api/conf')
var contentAnalysis = require('api/yahoo/contentAnalysis')
var extractor = require('api/extractor')
var CharsetConverter = require('api/extractor/CharsetConverter')
var batchInsert = require('api/db/batchInsert')
var ExtError = require('api/error').ExtError
var filterTags = require('api/tags/filter')

var PARALLEL = 30
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

/**
 * Process all feeds from the feeds collection.
 *
 * Options:
 *   - `parallel` amount of feeds processed in parallel
 *   - `feed` only this specific feed
 *   - `feeds` array of feeds
 *   - `update` update existing posts, defaults to false
 *   - `retry` retry on error, defaults to true
 *
 * @param {Object} [options]
 * @return {Batch}
 */
module.exports = function(options) {
    return function* () {
        var batch
        var processor = processOneWithRetry
        var feeds
        var query
        var errors = []

        options || (options = {})
        if (options.retry === false) processor = processOne
        batch = Batch().throws(false).concurrency(options.parallel || PARALLEL)

        if (options.query) {
            query = options.query
        } else if (options.feed) {
            query = {feed: options.feed}
        }

        feeds = yield m.model('rssfeed')
            .find(query)
            .select({_id: 1, feed: 1})
            .lean()
            .limit(options.limit)
            .exec()

        feeds.forEach(function(feed) {
            batch.push(function(done) {
                if (options.verbose) console.log(feed.feed)
                processor(feed, options, function(err, _errors) {
                    var update

                    if (err) {
                        update = {$inc: {failsCounter: 1}}
                    } else {
                        update = {$set: {failsCounter: 0, lastSync: new Date()}}
                    }

                    errors = errors.concat(_errors)

                    m.model('rssfeed')
                        .update({_id: feed._id}, update)
                        .exec(function(_err) {
                            done(err || _err, feed)
                        })
                })
            })
        })

        if (feeds.length) return yield (function(callback) {
            batch.end(function(_errors) {
                errors = _.compact(errors.concat(_errors))
                callback(null, errors)
            })
        })

        return errors
    }
}

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
            articles = articles.map(normalize)
            articles = yield prefilter(articles)
            errors = errors.concat(yield addSiteData(articles))
            errors = errors.concat(yield addAnalyzedTags(articles))
            articles = articles.filter(postfilter)
            articles.forEach(function(article) {
                article.tags = article.tags.filter(filterTags)
            })
            yield batchInsert('article', articles)
        } catch(_err) {
            err = _err
            err.feed = feed
            if (!err.level && IGNORE_ERRORS.test(err.message)) err.level = 'trace'
        }

        callback(err, errors)
    })()
}


/**
 * Process one and retry on fail.
 *
 * @see processOne
 */
function processOneWithRetry(feed, options, callback) {
    var op = retry.operation({retries: 3})

    op.attempt(function(attempt) {
        processOne(feed, options, function(err, errors) {
            if (op.retry(err)) return
            callback(err ? op.mainError() : null, errors)
        })
    })
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
function addAnalyzedTags(articles, callback) {
    if (!articles.length) return callback()

    var batch = Batch().throws(false).concurrency(PARALLEL)

    articles.forEach(function(article) {
        batch.push(function(done) {
            var text = _s.stripTags(article.description).trim()
            contentAnalysis.analyze({text: text})(function(err, data) {
                var tags
                if (err) err.article = article
                if (err || !data) return done(err)
                tags = _.pluck(data.entities, 'content')
                tags = _.pluck(data.categories, 'content')
                tags = _.invoke(tags, 'toLowerCase')
                article.tags = article.tags.concat(tags)
                article.tags = _.uniq(article.tags)
                done()
            })
        })
    })

    batch.end(function(errors) {
        // XXX Should we log here something?
        callback(null, errors)
    })
}

addAnalyzedTags = thunkify(addAnalyzedTags)

/**
 * Filter out articles without links or those once we have already synced.
 */
function prefilter(articles) {
    return function* () {
        var currArticles, urlsMap

        currArticles = yield m.model('article')
            .find({url: {$in: _.pluck(articles, 'url')}})
            .select({url: 1})
            .lean()
            .exec()

        urlsMap = _.groupBy(currArticles, function(article) {
            return article.url
        })

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
function postfilter(article) {
    // Has no tags - we can't find it.
    if (_.isEmpty(article.tags)) return false
    // Has no title - we can't list it.
    if (!article.title) return false

    return true
}

/**
 * Normalize an article to our format.
 */
function normalize(article) {
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
}


/**
 * Extract data from the site, extend the article.
 */
function addSiteData(articles, callback) {
    if (!articles.length) return callback()

    var batch = Batch().throws(false).concurrency(PARALLEL)

    articles.forEach(function(article) {
        batch.push(function(done) {
            extractor.extractWithRetry(article.url)(function(err, data) {
                if (err) {
                    err.url = article.url
                    return done(err)
                }
                _.extend(article, data)
                done()
            })
        })
    })

    batch.end(function(errors) {
        // XXX Should we log here something?
        callback(null, errors)
    })
}

addSiteData = thunkify(addSiteData)
