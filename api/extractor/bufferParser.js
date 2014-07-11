'use strict'

/**
 * Aggregate chunks to one buffer.
 */
module.exports = function(options) {
    return function(res, callback) {
        var data
        var type = res.headers['content-type'] || ''

        if (!options.type.test(type)) {
            return res.req.emit('error', new Error('Bad content type'))
        }

        res.on('data', function(chunk) {
            data = data ? Buffer.concat([data, chunk]) : chunk
            if (data.length > options.maxLength) {
                res.emit('end')
            }
        })

        res.on('end', function() {
           callback(null, data)
        })
    }
}

