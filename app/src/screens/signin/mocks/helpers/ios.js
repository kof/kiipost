define(function(require, exports, module) {
    'use strict'

    var ios = require('../../helpers/ios')

    module.exports = function() {
        ios.available = function() {
            return new Promise(function(fulfill, reject) {
                fulfill()
            })
        }

        ios.signin = function() {
            return new Promise(function(fulfill, reject) {
                fulfill({
                    consumerKey: 'JmTqJFn47mOp14NpR0UiSdxig',
                    consumerSecret: 'MHTdjpIwfVjcV2rZOyxesl939FqlnIKFzE50DhLZmG5UCwAViI',
                    accessToken: '69033784-BBVmV09pyHhWrKDmB8G6oBySxOKkM1koM9bphkQlF',
                    accessTokenSecret: 'RH7VOQjjTYtlU0CZ1TRvYjLaF7ZIig4zOnZ4jy0akBnwT',
                    screenName: 'Oleg',
                    userId: '69033784',
                    provider: 'twitter'
                })
            })
        }

        ios.isSupported = function() {
            return true
        }
    }
})
