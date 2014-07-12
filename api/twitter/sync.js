'use strict'

var m = require('mongoose')
var _ = require('underscore')
var _s = require('underscore.string')
var Batch = require('batch')
var thunkify = require('thunkify')

var client = require('api/twitter/client')
var extractor = require('api/extractor')
var log = require('api/log')
var contentAnalysis = require('api/yahoo/contentAnalysis')
var batchInsert = require('api/db/batchInsert')
var filterTags = require('api/tags/filter')

var PARALLEL = 50
var TWEETS_AMOUNT = 200

/**
 * Get links from users twitter account.
 *
 * @param {Object} options
 * @param {ObjectId} options.userId
 */
module.exports = function(options) {
    return function* () {
        var user = yield findUser(options)

        var twitterOptions = {count: TWEETS_AMOUNT}
        var latestMemo = yield findLatestMemo(options)
        if (latestMemo && latestMemo.tweetId) {
            twitterOptions.sinceId = latestMemo.tweetId
        }

        var tweets
        try {
            tweets = yield [
                fetchUserTweets(user, twitterOptions),
                fetchFavorites(user, twitterOptions)
            ]
            tweets = [].concat(tweets[0], tweets[1])
        } catch(err) {
            // Ignore rate limit.
            if (err.statusCode != 429) throw err
            return
        }

        if (!tweets.length) return
        tweets = tweets.filter(hasLinks)
        var memos = tweets.map(toMemo)

        yield addArticles(memos)
        yield addAnalyzedTags(memos)

        memos.forEach(function(memo) {
            var article = memo.articles[0]
            if (article && _.isArray(article.tags)) article.tags = article.tags.filter(filterTags)
            memo.userId = user._id
        })

        yield batchInsert('memo', memos)
    }
}

/**
 * Find latest memo in the db.
 */
function findLatestMemo(options) {
    return function* () {
        return yield m.model('memo')
            .findOne({userId: options.userId, tweetId: {$exists: true}})
            .sort({createdAt: -1})
            .exec()
    }
}

/**
 * Find user in the db.
 */
function findUser(options) {
    return function* () {
        return yield m.model('user')
            .findById(options.userId)
            .select({twitter: 1})
            .exec()
    }
}

/**
 * Fetch tweets from twitter done by passed user.
 */
function fetchUserTweets(user, options) {
    return function* () {
        return yield client.create(user.twitter)
            .getUserTimeline(options)
    }
}

/**
 * Fetch users favorites from twitter.
 */
function fetchFavorites(user, options) {
    return function* () {
        return yield client.create(user.twitter)
            .getFavorites(options)
    }
}

/**
 * Returns true if tweet has at least one link.
 */
function hasLinks(tweet) {
    return tweet.entities && !_.isEmpty(tweet.entities.urls)
}

/**
 * Pick data we need from tweets.
 */
function toMemo(tweet) {
    return {
        tweetId: tweet.idStr,
        text: tweet.text,
        createdAt: tweet.createdAt,
        urls: _.pluck(tweet.entities.urls, 'expandedUrl')
    }
}

/**
 * Extract data from html page behind the first url.
 */
function addArticles(memos, callback) {
    var batch = Batch().throws(false).concurrency(PARALLEL)

    memos.forEach(function(memo) {
        batch.push(function(done) {
            memo.articles = []
            extractor.extractWithRetry(memo.urls[0])(function(err, article) {
                if (err) return done(err)
                memo.articles.push(article)
                done()
            })
        })
    })

    batch.end(function(errors) {
        // XXX Should we log here something?
        callback()
    })
}

addArticles = thunkify(addArticles)

/**
 * Add tags to the first article by analyzing its text.
 */
function addAnalyzedTags(memos, callback) {
    var batch = Batch().throws(false).concurrency(PARALLEL)

    memos.forEach(function(memo) {
        batch.push(function(done) {
            var article = memo.articles[0] // Analyze only first one.
            if (!article || !article.html) return done()
            var text = _s.stripTags(article.html).trim()
            if (!text) return done()
            contentAnalysis.analyze({text: text})(function(err, data) {
                if (err) return done(err)
                article.tags = article.tags.concat(_.pluck(data.entities, 'content'))
                article.tags = _.invoke(article.tags, 'toLowerCase')
                article.tags = _.uniq(article.tags)
                article.categories = _.pluck(data.categories, 'content')
                done()
            })
        })
    })

    batch.end(function(errors) {
        // XXX Should we log here something?
        callback()
    })
}

addAnalyzedTags = thunkify(addAnalyzedTags)
