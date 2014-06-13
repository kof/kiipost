var _ = require('underscore')

var ExtError = require('api/error').ExtError

var common = require('./common')

var TABLE = 'html'

/**
 * Query defaults, camelized.
 */
exports.queryOptions = {
    url: null,
    xpath: null
}

/**
 * Serialize html page.
 *
 * @param {Object} queryOptions see exports.queryOptions
 * @param {Function} callback
 */
exports.html = function(queryOptions, callback) {
    var query,
        data

    if (!queryOptions.url) return setImmediate(callback)

    _.defaults(queryOptions, exports.queryOptions)
    query = common.buildQuery(TABLE, queryOptions)
    data = _.defaults({q: query}, common.params)

    try {
        common.request('get', data, function(err, res) {
            if (err) return callback(err)
            callback(null, res && res.query && res.query.results)
        })
    } catch(err) {
        callback(new ExtError(err.message || 'Bad data', {
            err: err,
            queryOptions: queryOptions,
            data: data,
            query: query
        }))
    }
}
