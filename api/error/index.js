var util = require('util')
var _ = require('underscore')

/**
 * Create a custom error. The returned constructor have to be cached.
 *
 * @param {String} name.
 * @return {Function} CustomError.
 */
exports.create = function(name) {

    /**
     * Custom error constructor, accepts additional data.
     *
     * @param {String} message.
     * @param {Object} data is optional, can be passed with message as 1. param.
     */
    function CustomError(message, data) {
        Error.call(this)
        Error.captureStackTrace(this, CustomError)
        this.name = name

        if (typeof message == 'object') {
            data = message
            message = data.message
        }

        this.message = message

        _.extend(this, data)
    }

    util.inherits(CustomError, Error)

    return CustomError
}

/**
 * General purpose error constructor, accepts additional data.
 *
 * @param {String} message.
 * @param {Object} data.
 */
exports.ExtError = exports.create('ExtError')

/**
 * Error constructor for errors which will be passed to the end user,
 * accepts additional data.
 *
 * @param {String} message.
 * @param {Object} data.
 */
exports.UserError = exports.create('UserError')

exports.UserError.prototype.level = 'trace'

/**
 * Error constructor for errors aggregation. Can be used in long running scripts
 * which should not die on first error. Accepts additional data.
 *
 * @param {String} message.
 * @param {Object} data.
 */
exports.MultiError = exports.create('MultiError')

/**
 * Default list of properties to copy.
 */
exports.MultiError.PROPERTIES = {
    message: true,
    code: true,
    type: true,
    level: true,
    stack: true
}

/**
 * Add error.
 *
 * @param {Error} [err]
 * @param {Object} [properties] list of properties to copy
 * @return {MultiError} this
 */
exports.MultiError.prototype.add = function(err, properties) {
    var props = exports.MultiError.PROPERTIES

    if (!err || !err.length) return this

    this.errors || (this.errors = [])

    if (properties) props = _.extend({}, props, properties)

    function add(err) {
        var newErr = {}
        _.each(props, function(val, name) {
            if (val && err[name]) newErr[name] = err[name]
        })
        this.errors.push(newErr)
    }

    _.isArray(err) ? _.each(err, add, this) : add.call(this, err)

    return this
}

/**
 * Remove all duplicate errors.
 */
exports.MultiError.prototype.uniq = function() {
    this.errors = exports.uniq(this.errors)

    return this
}

/**
 * Limit amount of errors. Sometimes logging all errors doesn't make sense.
 *
 * @param {Number} limit
 */
exports.MultiError.prototype.limit = function(limit) {
    if (this.errors) {
        this.errors = _.first(this.errors, limit)
    }

    return this
}

/**
 * Reduce errors array to unique once.
 *
 * @param {Array}
 * @return {Array}
 */
exports.uniq = function(errors) {
    if (!errors || errors.length < 2) return errors
    var index = {}

    return errors.filter(function(err) {
        if (!index[err.message]) return index[err.message] = true
        return false
    })
}
