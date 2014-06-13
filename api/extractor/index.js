'use strict'

var request = require('request')
var _ = require('underscore')
var _s = require('underscore.string')
var url = require('url')
var sax = require('sax')
var retry = require('retry')
var thunkify = require('thunkify')

var conf = require('api/conf')

var isIcon = /icon/i
var isLogo = /logo/i
var isIco = /\.ico/i // They are too small for our purpose.
var isDataImage = /data:image\//i
var isOgImage = /og:image/i
var isTitle = /title/i
var isDescription = /description/i
var isTags = /tags|tag|tags/i

var MIN_IMAGE_WIDTH = 200
var MAX_IMAGES_AMOUNT = 5

sax.MAX_BUFFER_LENGTH = Infinity

/**
 * Extract icon and a big image from a website.
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.extract = thunkify(function(url, callback) {
    fetch(url, function(err, data) {
        var res = {}

        if (err || !data) return callback(err, res)

        res.icon = findIcon(data, url)
        res.images = findImages(data, url, MIN_IMAGE_WIDTH, MAX_IMAGES_AMOUNT)
        res.title = findTitle(data)
        res.description = findDescription(data)
        res.tags = findTags(data)

        callback(null, res)
    })
})

/**
 * Find data with retry
 *
 * @see exports.extract
 */
exports.extractWithRetry = thunkify(function(url, callback) {
    var op = retry.operation({retries: 3})

    op.attempt(function(attempt) {
        exports.extract(url)(function(err, data) {
            if (op.retry(err)) return
            callback(err ? op.mainError() : null, data)
        })
    })
})

/**
 * Fetch website document, serialize img, link, meta tags.
 *
 * @param {String} url
 * @param {Function} callback
 */
function fetch(url, callback) {
    var req
    var saxStream
    var data = {img: [], link: [], meta: []}

    callback = _.once(callback)

    saxStream = sax.createStream(false, {lowercase: true})
        .on('error', function() {
            saxStream._parser.error = null;
            saxStream._parser.resume();
        })
        .on('opentag', function(node) {
            if (data[node.name]) {
                node.attributes || (node.attributes = {})
                data[node.name].push(node)
            }
        })
        .on('end', function() {
            _.each(data, function(arr, key) {
                data[key] = _.compact(arr)
            })

            callback(null, data)
        })

    // Bad uri emits before error handler is attached.
    try {
        req = request({
            url: url,
            // Some feeds do not response without user-agent and accept headers.
            headers: {
                'user-agent': conf.request.agent,
                accept: conf.request.accept
            },
            method: 'get',
            timeout: conf.request.timeout,
            pool: false
        })
    } catch(err) {
        return setImmediate(callback, err)
    }

    req.setMaxListeners(50)

    req
        .on('error', callback)
        .on('response', function(res) {
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'))
            if (!res.headers || !/html/i.test(res.headers['content-type'])) return callback()
            this.pipe(saxStream)
        })
}

function findIcon(data, baseUrl) {
    var icons = []
    var icon

    // Find links with rel f.e. rel="apple-touch-icon"
    _.each(data.link, function(link) {
        var a = link.attributes

        if (a.rel && a.href) {
            if (isIcon.test(a.rel) && !isIco.test(a.href) && !isDataImage.test(a.href)) {
                a.href = a.href.trim()
                if (a.href) icons.push(a.href)
            }
        }
    })

    // Take the last one, its most likely to be the largest one.
    if (icons.length) icon = icons.pop()

    // Find site icon if not already done.
    _.each(data.img, function(img) {
        var a = img.attributes

        if (!icon && a.src) {
            if (isLogo.test(a.src) && !isDataImage.test(a.href)) {
                a.src = a.src.trim()
                if (a.src) icon = a.src
            }
        }
    })
    if (icon) icon = url.resolve(baseUrl, icon)

    return icon
}

/**
 * Find images with width attribute according minWidth,
 * return them sorted by width descending.
 */
function findImages(data, baseUrl, minWidth, maxAmount) {
    var images

    // - Filter images without width or width less than min.
    // - Parse width attr to number.
    images = data.img.filter(function(img) {
        var a = img.attributes

        if (a.width) {
            a.width = parseInt(a.width.trim() || 0, 10)
            if (a.width >= minWidth &&
                a.src &&
                !isDataImage.test(a.src)) {
                return true
            }
        }
    })

    // Sort images by width ascending.
    images = _.sortBy(images, function(img) {
        return img.attributes.width
    })

    // Leave the urls only.
    images = images.map(function(image) {
        return image.attributes.src.trim()
    })

    images = _.uniq(images)

    // When nothing found, use og:image.
    if (!images.length) {
        _.find(data.meta, function(meta) {
            var attr = meta.attributes
            if (isOgImage.test(attr.property)) {
                images.push(attr.content)
                return true
            }
        })
    }

    images = images.map(function(imageUrl) {
        return url.resolve(baseUrl, imageUrl)
    })

    images.splice(0, maxAmount)

    return images
}

function findTitle(data) {
    var title

    _.find(data.meta, function(meta) {
        var attr = meta.attributes
        if (isTitle.test(attr.name) || isTitle.test(attr.property)) {
            title = attr.content
        }
    })

    return title
}

function findDescription(data) {
    var descr

    _.find(data.meta, function(meta) {
        var attr = meta.attributes
        if (isDescription.test(attr.name) || isDescription.test(attr.property)) {
            descr = attr.content
        }
    })

    return descr
}

function findTags(data) {
    var tags = ''

    data.meta.forEach(function(meta) {
        var attr = meta.attributes

        // Collect tags
        if (isTags.test(attr.name)) {
            tags += attr.content
        }
    })
    tags = tags.split(',')
    tags = tags.map(_s.trim)
    tags = _.compact(tags)
    tags = _.uniq(tags)

    return tags
}

function analyzeTags(url) {

}




