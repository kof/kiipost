'use strict'

var Twit = require('twit')
var merge = require('merge')
var _ = require('underscore')

var conf = require('api/conf')
var transformKeys = require('shared/utils/transformKeys')

var consumer = transformKeys(conf.twitter, 'underscored')

function wrap(method, path, defaults) {
    Twit.prototype[method] = function(options) {
        options = merge({}, defaults, options)
        options = transformKeys(options, 'underscored')
        return function(callback) {
            this.get(path, options, function(err, data) {
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

exports.create = function(auth) {
    auth = transformKeys(auth, 'underscored')
    return new Twit(merge({}, consumer, auth))
}
