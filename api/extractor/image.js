'use strict'

var thunkify = require('thunkify')
var imageSize = require('image-size')
var imageType = require('image-type')
var _ = require('underscore')
var url = require('url')
var mods = {'http:': require('http'), 'https:': require('https')}

var enabledTypes = {png: true, jpg: true}

/**
 * Find an image which is big enough by checking real size.
 * Put it at first position to be used as main article image.
 *
 * @param {Array} images
 */
exports.process = function(images, options) {
    return function* () {
        for (var i = 0; i < images.length; i++) {
            var image = images[i]
            try {
                var meta = yield exports.getMeta(image.url)
                if (enabledTypes[meta.type] && meta.width >= options.minWidth) {
                    images.splice(i, 1)
                    meta.url = image.url
                    images.unshift(meta)
                    break;
                }
            // We ignore errors here because its optional.
            } catch(err) {}
        }

        return images
    }
}

/**
 * Download just view bytes to detect the image size and type.
 *
 * @param {String} uri
 */
exports.getMeta = thunkify(function(uri, callback) {
    callback = _.once(callback)

    var options = url.parse(uri)
    var req

    req = mods[options.protocol].get(options, function(res) {
        var data, lastErr, meta

        res.on('data', function(chunk) {
            data = data ? Buffer.concat([data, chunk]) : chunk
            try {
                meta = imageSize(data)
                meta.type = imageType(data)
                req.abort()
            } catch(err) {
                lastErr = err
            }
        })
        res.on('end', function() {
            if (meta) {
                callback(null, meta)
            } else {
                callback(lastErr || new Error('Could not read image meta'))
            }
        })
    })
    req.on('error', callback)
    req.setTimeout(10000)
    req.end()
})
