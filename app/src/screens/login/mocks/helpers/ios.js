define(function(require, exports, module) {
    'use strict'

    var ios = require('../../helpers/ios')

    ios.isAvailable = function() {
        return new Promise(function(fulfill, reject) {
            fulfill()
        })
    }

    ios.login = function() {
        return new Promise(function(fulfill, reject) {
            fulfill({
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                screenName: 'screenName',
                userId: 'userId'
            })
        })
    }

    ios.isSupported = function() {
        return true
    }
})
