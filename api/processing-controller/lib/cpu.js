'use strict'

var os = require('os')
var cpusAmount = os.cpus().length

/**
 * Ensures cpu load doesn't go too high.
 *
 * @param {Object} [options]
 * @param {Number} [options.max] ensures cpu load doesn't goes higher than passed
 *   value. Possible values 0-1, where 1 is 100% of cpu usage is allowed.
 * @return {Object} `ok` is true if current usage is ok.
 */
module.exports = function(options) {
    options || (options = {})
    options.max || (options.max = 0.8)

    return function() {
        var value = os.loadavg()[0] / cpusAmount

        return {
            ok: value < options.max,
            value: value
        }
    }
}
