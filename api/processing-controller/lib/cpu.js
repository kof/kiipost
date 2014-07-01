'use strict'

var os  = require('os-utils')

/**
 * Ensures cpu load doesn't go too high.
 *
 * @param {Object} [options]
 * @param {Number} [options.max] ensures cpu load doesn't goes higher than passed
 *   value. Possible values 0-1, where 1 is 100% of cpu usage is allowed.
 * @return {Object} `ok` is true if current usage is ok.
 */
module.exports = function(options) {
    var intervalId, value = 0

    options || (options = {})
    options.max || (options.max = 0.8)

    function get() {
        return {
            ok: value < options.max,
            value: value
        }
    }

    get.start = function() {
        function get() {
            os.cpuUsage(function(v) {
                value = v
            })
        }

        intervalId = setInterval(get, 1000)
        get()
    }

    get.stop = function() {
        clearInterval(intervalId)
    }

    return get
}

