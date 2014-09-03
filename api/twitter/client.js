'use strict'

var Twit = require('twit')
var _ = require('underscore')

var conf = require('api/conf')
var transformKeys = require('shared/utils/transformKeys')

var consumer = transformKeys(conf.twitter, 'underscored')

function wrap(method, path, defaults) {
    Twit.prototype[method] = function(options) {
        options = _.extend({}, defaults, options)
        options = transformKeys(options, 'underscored')
        return function(callback) {
            var method = options.method || 'get'
            delete options.method
            this[method](path, options, function(err, data) {
                callback(err, transformKeys(data, 'camelize', true))
            })
        }.bind(this)
    }
}

wrap('verifyCredentials', 'account/verify_credentials', {
    includeEntities: false,
    skipStatus: true
})
wrap('showUser', 'users/show', {includeEntities: false})
wrap('getHomeTimeline', 'statuses/home_timeline', {trimUser: true})
wrap('getUserTimeline', 'statuses/user_timeline', {trimUser: true})
wrap('getFavorites', 'favorites/list')
wrap('getConfig', 'help/configuration')

wrap('tweet', 'statuses/update', {method: 'post'})

exports.create = function(auth) {
    auth = transformKeys(auth, 'underscored')
    return new Twit(_.extend({}, consumer, auth))
}
