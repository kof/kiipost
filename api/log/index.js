'use strict'

var raven = require('raven')
var util = require('util')
var _ = require('underscore')
var cycle = require('cycle')

var options
var client
var noop = function() {}

options = {
    stdout: true,
    stderr: true,
    sentryDsn: null,
    processFile: process.argv[1]
}

/**
 *  The six logging levels (in order):
 *
 *  - trace (the least serious, will not be sent to sentry)
 *  - debug
 *  - info
 *  - warning
 *  - error
 *  - fatal (the most serious)
 *
 * Sentry documentation
 * http://sentry.readthedocs.org
 *
 * @param {Mixed} obj nothing will happen if null
 * @param {Mixed} eventData optional
 * @param {Function} callback optional
 * @param {String} level - optional and internal only, set if used from log.xxx
 */
function log(obj, eventData, callback, level) {
    var prop
    var data = {}
    var extra = {}
    var isError = obj instanceof Error

    if (!eventData) {
        eventData = {}
    } else if (typeof eventData == 'function') {
        callback = eventData
        eventData = {}

    // eventData can be a string or a number
    } else if (typeof eventData != 'object') {
        eventData = {descr: eventData}
    }

    typeof callback == 'function' || (callback = noop)

    // Ignore calls without error, sometimes you just want to
    // log if there is an error.
    if (!obj) return setImmediate(callback)

    // Copy err instance properties to the data obj
    // f.e. mongoose has err.errors
    if (isError) {
        for (prop in obj) {
            if (!eventData[prop] && _.has(obj, prop)) {
                eventData[prop] = obj[prop]
            }
        }
    }

    extra.eventData = eventData
    extra.processFile = options.processFile

    // If error instance has a level property, use it.
    data.level = level || obj.level || eventData.level
    data.extra = extra

    if (data.level == 'trace') return setImmediate(callback)

    // Removed temporary as it caused high cpu load
    // data = cycle.decycle(data)

    if (client) {
        try {
            if (isError) {

                // RangeError doesn't has a stack property
                if (!obj.stack) {
                    Error.captureStackTrace(obj, log)
                }
                client.captureError(obj, data)
            } else {
                client.captureMessage(obj, data)
            }
        } catch(err) {
            client.captureError(err, {extra: extra, level: level})
        }
    }

    if (isError) {
        if (options.stderr) {
            console.error(obj.stack)
            console.error(util.inspect(data, {
                showHidden: true,
                depth: 5
            }))
        }
    } else if (options.stdout) {
        console.log(obj, data)
    }

    // Hope message is sent already.
    setTimeout(callback, 2000)
}

module.exports = exports = log

/**
 * Setup logger.
 *
 * @param {Object} {sentryDsn: String}
 */
exports.setup = function(_options) {
    _options = _options || {}
    _.extend(options, _options)

    if (options.sentryDsn) {
        client = new raven.Client(options.sentryDsn)
        client.on('error', function() {

            // Log errors into stderr if sentry doesn't accept events.
            options.stderr = true
            console.log('Sentry was not able to accept an event.')
        })
        client.on('logged', function() {

            // Sentry seems to accept events - restore the option.
            options.stderr = _options.stderr
        })
    }
}

_.each(['trace', 'debug', 'info', 'warn', 'error', 'fatal'], function(level) {
    exports[level] = function(obj, eventData, callback) {
        log(obj, eventData, callback, level)
    }
})
