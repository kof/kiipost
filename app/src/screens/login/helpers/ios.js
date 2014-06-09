define(function(require, exports, module) {
    'use strict'

    var qs = require('qs')
    var transformKeys = require('components/utils/transformKeys')

    exports.login = function() {
        var api = window.socialAuth

        return new Promise(function(fulfill, reject) {
            function isAvailable() {
                if (!api) {
                    var err = new Error('Plugin not loaded.')
                    err.type = 'PLUGIN_NOT_LOADED'
                    return reject(err)
                }
                api.isTwitterAvailable(getAccount, function() {
                    var err = new Error('App is disabled.')
                    err.type = 'DISABLED'
                    reject(err)
                })
            }

            function getAccount() {
                var err = new Error('No accounts connected.')
                err.type = 'NOT_CONNECTED'

                api.returnTwitterAccounts(
                    function success(names) {
                        if (!names.length) return reject(err)
                        auth(names[0])
                    },
                    function error() {
                        reject(err)
                    }
                )
            }

            function auth(name) {
                api.performTwitterReverseAuthentication(
                    function success(res) {
                        var params = qs.parse(res)
                        fulfill(transformKeys(params, 'camelize'))
                    },
                    function error(res) {
                        var err = new Error(res)
                        err.type = 'AUTH'
                        reject(err)
                    },
                    name
                )
            }

            isAvailable()
        })
    }

    exports.isSupported = function() {
        return Boolean(window.socialAuth)
    }
})
