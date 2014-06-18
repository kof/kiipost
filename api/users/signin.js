'use strict'

var m = require('mongoose')
var _ = require('underscore')

var twitterClient = require('api/twitter/client')
var queue = require('api/queue')
var publicProps = require('./publicProps')

var publicPropsKeys = _.keys(publicProps)

/**
 * Signup or login a user.
 *
 * @param {Object} auth
 * @param {Boolean} isAuthorized true users session is alive
 */
module.exports = function signin(auth, isAuthorized) {
    return function* () {
        if (!isAuthorized) yield verify(auth)

        var user = yield find(auth)

        if (user) {
            yield touch(auth)
        } else {
            user = yield fetch(auth)
            user = yield create(auth, user)
        }

        if (!isAuthorized) yield queue.enqueue('TwitterSync', {userId: user._id, block: user._id})

        return user
    }
}

/**
 * Verify user credentials.
 */
function verify(auth) {
    return function* () {
        switch (auth.provider) {
            case 'twitter':
                return yield twitterClient.create(auth).verifyCredentials()
        }
    }
}

/**
 * Fetch user data from services.
 */
function fetch(auth) {
    return function* () {
        switch (auth.provider) {
            case 'twitter':
                return yield twitterClient.create(auth).showUser({userId: auth.userId})
        }
    }
}

/**
 * Find user in the db.
 */
function find(auth) {
    var model = m.model('user')

    return function* () {
        var query

        switch (auth.provider) {
            case 'twitter':
                query = model.findOne({'twitter.id': auth.userId})
        }

        return yield query
            .select(publicProps)
            .lean()
            .exec()
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
    return function* () {
        var update = {lastLoginDate: new Date()}

        switch (auth.provider) {
            case 'twitter':
                update['twitter.accessToken'] = auth.accessToken
                update['twitter.accessTokenSecret'] = auth.accessTokenSecret
        }

        yield m.model('user')
            .update({'twitter.id': auth.userId}, {$set: update})
            .exec()
    }
}


/**
 * Create a new user.
 */
function create(auth, data) {
    return function* () {
        var user
        switch (auth.provider) {
            case 'twitter':
                user = fromTwitter(auth, data)
        }
        user.signupDate = user.lastLoginDate = new Date()
        user = yield m.model('user').create(user)

        return _.pick(user, publicPropsKeys)
    }
}

