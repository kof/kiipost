'use strict'

var ios = require('../../helpers/ios')
var conf = require('app/conf')

module.exports = function() {
    ios.available = function() {
        return new Promise(function(fulfill, reject) {
            fulfill()
        })
    }

    ios.signin = function() {
        return new Promise(function(fulfill, reject) {
            fulfill({
                accessToken: conf.twitter.accessToken,
                accessTokenSecret: conf.twitter.accessTokenSecret,
                userId: conf.twitter.userId,
                provider: 'twitter'
            })
        })
    }

    ios.isSupported = function() {
        return true
    }
}
