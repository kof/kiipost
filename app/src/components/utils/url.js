define(function(require, exports, module) {
    'use strict'

    /**
     * Parse url using browsers anchor dom element.
     *
     * @param {String} url
     * @return {Object}
     */
    exports.parse = (function() {
        var el = document.createElement('a')

        return function(url) {
            el.href = url
            return el
        }
    }())
})
