'use strict'

var m = require('mongoose')
var _ = require('underscore')
var forEach = require('generator-foreach')

var client = require('api/twitter/client')
var extractor = require('api/extractor')
var log = require('api/log')

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
        var latestLink = yield findLatestSavedLink(options)
        if (latestLink && latestLink.tweetId) {
            var latestTweetId = latestLink.tweetId
        }

        var userTweets = yield fetchUsersTweets(user, latestTweetId)
        var favoriteTweets = yield fetchFavorites(user, latestTweetId)
        var all = [].concat(userTweets).concat(favoriteTweets)
        console.log(all.length)
        all = all.filter(hasLinks)
        all = all.map(pickData)
        all.forEach(function(tweet)  {
            tweet.userId = user._id
        })
        yield addTags(all)
        console.log(all)
        yield save(all)
    }
}

function findLatestSavedLink(options) {
    return function* () {
        return yield m.model('userlink')
            .findOne({userId: options.userId, tweetId: {$exists: true}})
            .sort({createdAt: -1})
            .exec()
    }
}

function findUser(options) {
    return function* () {
        return yield m.model('user')
            .findById(options.userId)
            .select({twitter: 1})
            .exec()
    }
}

function fetchUsersTweets(user, sinceId) {
    return function* () {
        return yield client.create(user.twitter)
            .getHomeTimeline({sinceId: sinceId})
    }
}

function fetchFavorites(user, sinceId) {
    return function* () {
        return yield client.create(user.twitter)
            .getFavorites({sinceId: sinceId})
    }
}

/**
 * Returns true if tweet has at leas one link.
 */
function hasLinks(tweet) {
    return tweet.entities && !_.isEmpty(tweet.entities.urls)
}

/**
 * Pick data we need from tweets.
 */
function pickData(tweet) {
    return {
        tweetId: tweet.idStr,
        memo: tweet.text,
        createdAt: tweet.createdAt,
        urls: _.pluck(tweet.entities.urls, 'expandedUrl')
    }
}

function addTags(links) {
    return function* () {
        yield * forEach(links, function* (link) {
            try {
                _.extend(link, yield extractor.extractWithRetry(link.urls[0]))
            } catch(err) {
                log(err)
            }
        })
    }
}

function save(all) {
    return function* () {

    }
}
