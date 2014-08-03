define(function(require, exports, module) {
    'use strict'

    var raven = require('raven-js')
    var _ = require('underscore')
    var alert = require('app/components/notification/alert')

    var options = {sentryDsn: null, reload: false}

    module.exports = exports = function(obj, eventData, callback, level) {
        var options = {extra: {}}

        if (typeof eventData == 'function') {
            callback = eventData
            eventData = null
        }

        if (!obj) return setTimeout(callback)

        if (!eventData) eventData = {}
        options.level = obj.level || eventData.level || level
        options.extra.eventData = eventData

        if (options.level == 'trace') {
            console.log(obj, options)
            return setTimeout(callback, 500)
        }

        if (options.sentryDsn) {
            raven.captureException(obj, options)
        } else {
            console.log(obj)
        }

        // Let raven send the error before executing callback, because
        // callback can reload the page.
        setTimeout(callback, 500)
    }

    exports.setUser = raven.setUser

    exports.setup = function(_options) {
        if (!_options.sentryDsn) throw new Error('Sentry dsn required')
        options = _options
        raven.config(options.sentryDsn, {
            logger: 'web',
            ignoreErrors: [
                'Script error.'
            ]
        }).install()

        if (options.reload) {
            document.addEventListener('ravenHandle', _.debounce(function() {
                alert('Ups, an error is happened. Our developers are notified.')
                location.reload()
            }, 300))
        }
    }
})
