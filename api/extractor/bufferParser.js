'use strict'

/**
 * Aggregate chunks to one buffer.
 */
module.exports = function(res, callback) {
    var data

    res.on('data', function(chunk) {
        data = data ? Buffer.concat([data, chunk]) : chunk
    })

    res.on('end', function() {
       callback(null, data)
    })
}
