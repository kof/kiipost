var thunkify = require('thunkify')
var imageSize = require('image-size')
var _ = require('underscore')
var url = require('url')
var mods = {'http:': require('http'), 'https:': require('https')}

/**
 * Download just view bytes to detect the image size.
 *
 * @param {String} uri
 */
module.exports = thunkify(function(uri, callback) {
    callback = _.once(callback)

    var options = url.parse(uri)
    var req

    req = mods[options.protocol].get(options, function(res) {
        var data, lastErr, size

        res.on('data', function(chunk) {
            data = data ? Buffer.concat([data, chunk]) : chunk
            try {
                size = imageSize(data)
                req.abort()
            } catch(err) {
                lastErr = err
            }
        })
        res.on('end', function() {
            if (size) {
                callback(null, size)
            } else {
                callback(lastErr || new Error('Image size detection'))
            }
        })
    })
    req.on('error', callback)
    req.setTimeout(10000)
    req.end()
})
