'use strict'

var os = require('os')
var total = os.totalmem()

/**
 * Ensures that free memory in the os doesn't go below some value.
 *
 * @param {Object} [options]
 * @param {Number} [options.max] ensures used system memory doesn't go higher than
 *   passed number. Possible values 0-1, where 1 is 100% of memory usage is allowed.
 * @return {Object} `ok` is true if current usage is ok.
 */
module.exports = function(options) {
    options || (options = {})
    options.max || (options.max = 0.8)

    return function() {
        var value = (total - os.freemem()) / total

        return {
            ok: value < options.max,
            value: value
        }
    }
}
