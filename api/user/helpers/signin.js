'use strict'

var m = require('mongoose')
var _ = require('underscore')

var twitterClient = require('api/twitter-client')
var publicProps = require('./publicProps')

var publicPropsKeys = _.keys(publicProps)

/**
 * Signup or login a user.
 *
 * @param {Object} auth
 * @param {Boolean} isAuthorized true users session is alive
 */
module.exports = function signin(auth, isAuthorized) {
    return function *() {
        if (!isAuthorized) yield verify(auth)
        var user = yield find(auth)
        var res

        if (user) {
            yield touch(auth)
            res = user
        } else {
            user = yield fetch(auth)
            res = yield create(auth, user)
        }

        return res
    }
}

/**
 * Verify user credentials.
 */
function verify(auth) {
    return function *() {
        switch (auth.provider) {
            case 'twitter':
                return yield twitterClient.create(auth).verifyCredentials()
        }
    }
}

/**
 * Find user in the db.
 */
function find(auth) {
    return function(callback) {
        switch (auth.provider) {
            case 'twitter':
                m.model('user')
                    .findOne({'twitter.id': auth.userId})
                    .select(publicProps)
                    .lean()
                    .exec(callback)
        }
    }
}

/**
 * Fetch user data services.
 */
function fetch(auth) {
    return function *(callback) {
        switch (auth.provider) {
            case 'twitter':
                return yield twitterClient.create(auth).showUser({userId: auth.userId})
        }
    }
}

/**
 * Pick user data from twitter.
 */
function fromTwitter(auth, data) {
    var name = data.name.split(' ')
    var user = {}
    user.firstName = name.shift()
    user.lastName = name.join(' ')
    user.locale = data.lang
    user.imageUrl = data.profileImageUrl
    user.twitter = _.pick(auth, 'accessToken', 'accessTokenSecret')
    user.twitter.id = data.idStr
    _.extend(user.twitter, _.pick(data, 'location', 'protected',
        'verified', 'screenName'))
    return user
}

/**
 * Update users credentials and dates.
 */
function touch(auth) {
    return function(callback) {
        var update = {lastLoginDate: new Date()}

        switch (auth.provider) {
            case 'twitter':
                update['twitter.accessToken'] = auth.accessToken
                update['twitter.accessTokenSecret'] = auth.accessTokenSecret
        }

        m.model('user')
            .update({'twitter.id': auth.userId}, {$set: update})
            .exec(callback)
    }
}

/**
 * Create a new user.
 */
function create(auth, data) {
    return function(callback) {
        var user = fromTwitter(auth, data)

        user.signupDate = user.lastLoginDate = new Date()

        m.model('user').create(user, function(err, doc) {
            if (err) return callback(err)
            callback(null, _.pick(doc, publicPropsKeys))
        })
    }
}
