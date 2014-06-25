var _ = require('underscore')
var _s = require('underscore.string')
var request = require('superagent')

var ExtError = require('api/error').ExtError
var conf = require('api/conf')

var common = require('./common')

/**
 * Base service uri.
 */
exports.BASE_URI = 'http://query.yahooapis.com/v1/public/yql'

/**
 * Request params.
 */
exports.params = {
    format: 'json',
    q: null,
    diagnostics: false
}

/**
 * Build query string from object.
 *
 * @param {Object} params
 * @returm {String}
 */
exports.buildQuery = function(table, params) {
    var query = 'select * from ' + table + ' where',
        i = 0

    _.each(params, function(val, name) {
        if (!val) return
        if (i) query += ' and'
        val = String(val).replace(/([\\"])/g, '\\$1')
        name = _s.underscored(name)
        query += ' ' + name +'="' + val + '"'
        i++
    })

    return query
}

/**
 * Send request.
 *
 * @param {String} method
 * @param {Object} data
 * @param {Function} callback
 */
exports.request = function(method, data, callback) {
    request
        [method](exports.BASE_URI)
        .type('form')
        .send(data)
        .timeout(conf.request.timeout)
        .end(function(err, res) {
            if (err) {
                err.data = data
                return callback(err)
            }

            if (res.body.error) {
                return callback(
                    new ExtError(res.body.error.description, {
                        error: res.body.error,
                        response: res.text,
                        data: data
                    })
                )
            }

            callback(null, res.body)
        })
}
