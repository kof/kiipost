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
 * Otionally pass patterns to avoid duplicate errors which are never uniq, like
 * those containing line numbers or user ids.
 *
 * @param {Array} errors array of errors
 * @param {Array} [patterns] array of RegExp
 * @return {Array}
 */
exports.uniq = function(errors, patterns) {
    if (!errors || errors.length < 2) return errors
    var index = {}

    return errors.filter(function(err) {
        // Not an error or message already exist.
        if (!err) return false

        var found = index[err.message]

        // Found existing message using patterns
        if (!found && patterns) {
            patterns.find(function(pattern) {
                for (var message in index) {
                    if (pattern.test(message)) {
                        found = index[message]
                        return true
                    }
                }
            })
        }

        if (found) {
            found.sameErrorsAmount++
            return false
        }

        index[err.message] = err
        err.sameErrorsAmount = 0

        return true
    })
}
