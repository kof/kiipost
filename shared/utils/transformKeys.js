define(function(require, exports, module) {
    'use strict'

    var _ = require('underscore')
    var _s = require('underscore.string')

    /**
     * Camelize all object keys.
     *
     * @param {Object} obj
     * @param {String} transform
     * @param {Boolean} [deep] true if you want to transform objects recursively
     * @return {Object|Array}
     */
    module.exports = function transformKeys(obj, transform, deep) {
        var newObj

        if (_.isArray(obj)) {
            if (!deep) return obj
            return _.map(obj, function(item) {
                return transformKeys(item, transform, deep)
            })
        }

        if (!obj || typeof obj != 'object') return obj

        newObj = {}
        _.each(obj, function(val, key) {
            key = _s[transform](key)
            newObj[key] = transformKeys(val, transform, deep)
        })

        return newObj
    }
})
