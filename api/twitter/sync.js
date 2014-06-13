'use strict'

var m = require('mongoose')
var _ = require('underscore')
var _s = require('underscore.string')
var forEach = require('generator-foreach')

var client = require('api/twitter/client')
var extractor = require('api/extractor')
var log = require('api/log')
var contentAnalysis = require('api/yahoo/contentAnalysis')

var EXTRACT_PARALLEL = 20

/**
 * Get links from users twitter account.
 *
 * @param {Object} options
 * @param {ObjectId} options.userId
 */
module.exports = function(options) {
    return function* () {
        var user = yield findUser(options)
        var latestMemo = yield findLatestMemo(options)
        if (latestMemo && latestMemo.tweetId) {
            var latestTweetId = latestMemo.tweetId
        }

        var userTweets = yield fetchUserTweets(user, latestTweetId)
        var favoriteTweets = yield fetchFavorites(user, latestTweetId)
        var allTweets = [].concat(userTweets).concat(favoriteTweets)
        if (!allTweets.length) return
        allTweets = allTweets.filter(hasLinks)
        var memos = allTweets.map(toMemo)
        memos.forEach(function(tweet)  {
            tweet.userId = user._id
        })
        yield addArticles(memos)
        yield addAnalyzedTags(memos)
        yield save(memos)
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
function fetchUserTweets(user, sinceId) {
    return function* () {
        return yield client.create(user.twitter)
            .getHomeTimeline({sinceId: sinceId})
    }
}

/**
 * Fetch users favorites from twitter.
 */
function fetchFavorites(user, sinceId) {
    return function* () {
        return yield client.create(user.twitter)
            .getFavorites({sinceId: sinceId})
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
function addArticles(memos) {
    return function* () {
        try {
        yield * forEach(memos, function* (memo) {
            // Take only first url.
            memo.articles = [yield extractor.extractWithRetry(memo.urls[0])]
        })
        } catch(err) {
            console.log(err)
        }
    }
}

/**
 * Add tags to the first article by analyzing its text.
 */
function addAnalyzedTags(memos) {
    return function* () {
        yield * forEach(memos, function* (memo) {
            var article = memo.articles[0] // Analyze only first one.
            if (!article || !article.html) return
            var text = _s.stripTags(article.html).trim()
            if (!text) return
            var data = yield contentAnalysis.analyze({text: text})
            if (!data) return
            var entities = _.pluck(data.entities, 'content')
            var categories = _.pluck(data.categories, 'content')
            article.tags = article.tags.concat(entities).concat(categories)
            article.tags = _.invoke(article.tags, 'toLowerCase')
            article.tags = _.uniq(article.tags)
        })
    }
}

/**
 * Save memos to the db.
 */
function save(memos) {
    return function(callback) {
        if (!memos.length) return setImmediate(callback)

        callback = _.once(callback)

        var Model = m.model('memo')
        var newMemos = []

        // Manual validation because batch insert can't.
        memos.forEach(function(memo) {
            var doc = new Model()

            doc.set(memo).validate(function(err) {
                if (err) return callback(err)
                newMemos.push(doc.toObject())
                if (newMemos.length == memos.length) insert()
            })
        })

        function insert() {
            m.model('memo').collection.insert(
                newMemos,
                {safe: true, continueOnError: true},
                function(err) {
                    // Ignore MongoError: E11000 duplicate key error index
                    if (err && err.code == 11000) err = null
                    callback(err)
                }
            )
        }
    }
}
