var _ = require('underscore')
var thunkify = require('thunkify')

var ExtError = require('api/error').ExtError

var common = require('./common')

var TABLE = 'contentanalysis.analyze'

/**
 * Query defaults, camelized.
 */
exports.queryOptions = {
    text: null,
    url: null,
    relatedEntities: null,
    showMetadata: null,
    enableCategorizer: null,
    unique: true,
    max: 20
}

/**
 * Analyse content.
 *
 * @param {Object} queryOptions see exports.queryOptions
 * @param {Function} callback
 */
exports.analyze = thunkify(function(queryOptions, callback) {
    var query,
        data

    if (!queryOptions.text || !queryOptions.text.trim()) return setImmediate(callback)

    _.defaults(queryOptions, exports.queryOptions)
    query = common.buildQuery(TABLE, queryOptions)
    data = _.defaults({q: query}, common.params)

    try {
        common.request('post', data, function(err, res) {
            if (err) return callback(err)
            callback(null, format(res))
        })
    } catch(err) {
        callback(new ExtError(err.message || 'Bad data', {
            err: err,
            queryOptions: queryOptions,
            data: data,
            query: query
        }))
    }
})

/**
 * Format the response in form we need it.
 *
 * @param {Object} res
 * @return {Object}
 */
function format(res) {
    var ret = {entities: [], categories: []}
    var results
    var pick = {}

    if (!res || !res.query || !res.query.results) return ret

    results = res.query.results

    pick.entity = function(entity) {
        ret.entities.push({
            score: Number(entity.score),
            content: entity.text.content
        })
    }

    pick.yctCategory = function(category) {
        category.score = Number(category.score)
        ret.categories.push(category)
    }

    // Yahoos api shit
    // - antities can ba an array
    // - antities can be an object with entity property
    //   - entity can be an entity
    //   - entity can be an array of entities
    function walk(plural, singular) {
        if (results[plural]) {
            if (results[plural][singular]) {
                if (_.isArray(results[plural][singular])) {
                    _.each(results[plural][singular], pick[singular])
                } else {
                    pick[singular](results[plural][singular])
                }
            } else {
                _.each(results[plural], pick[singular])
            }
        }
    }

    walk('entities', 'entity')
    walk('yctCategories', 'yctCategory')

    return ret
}
