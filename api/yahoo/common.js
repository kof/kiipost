var _ = require('underscore')
var _s = require('underscore.string')
var request = require('request')

var ExtError = require('api/error').ExtError

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
    var options = {timeout: 5000, pool: false, method: method}

    if (method == 'get') options.qs = data
    else if (method == 'post') options.form = data

    request(
        exports.BASE_URI,
        options,
        function(err, res, body) {
            var json

            if (err) return callback(err)

            try {
                json = JSON.parse(body)
            } catch(err) {
                return callback(new ExtError('Bad response', {err: err, body: body, data: data}))
            }

            if (json.error) {
                return callback(
                    new ExtError(json.error.description, {
                        error: json.error,
                        body: body,
                        data: data
                    })
                )
            }

            callback(null, json)
        }
    )
}
