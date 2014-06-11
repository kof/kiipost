'use strict'

var Twit = require('twit')
var merge = require('merge')

var conf = require('api/conf')
var transformKeys = require('shared/utils/transformKeys')

var consumer = transformKeys(conf.twitter, 'underscored')

Twit.prototype.verifyCredentials = function(options) {
    options = merge({}, {includeEntities: false, skipStatus: true}, options)
    options = transformKeys(options, 'underscored')

    return function(callback) {
        this.get('account/verify_credentials', options, callback)
    }.bind(this)
}

exports.create = function(options) {
    options = transformKeys(options, 'underscored')
    return new Twit(merge({}, consumer, options))
}
