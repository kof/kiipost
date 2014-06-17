'use strict'

var request = require('request')
var _ = require('underscore')
var _s = require('underscore.string')
var url = require('url')
var sax = require('sax')
var readabilitySax = require('readabilitySAX')
var retry = require('retry')
var thunkify = require('thunkify')
var entities = require('entities')

var conf = require('api/conf')

var CharsetConverter = require('./CharsetConverter')

var isIcon = /icon/i
var isLogo = /logo/i
var isIco = /\.ico/i // They are too small for our purpose.
var isDataImage = /data:image\//i
var isOgImage = /og:image/i
var isDescription = /description/i
var isKeywords = /keywords|tag|tags/i

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
    fetchData(url, function(err, tags, article) {
        var res = {}

        if (err || !tags || !article) return callback(err, res)

        res = _.pick(article, 'title', 'score', 'url')
        res.icon = findIcon(tags, url)
        res.images = findImages(tags, url, MIN_IMAGE_WIDTH, MAX_IMAGES_AMOUNT)
        res.summary = _s.prune(_s.stripTags(findDescription(tags) || article.html), 250, '')
        res.description = article.html
        res.tags = findKeywords(tags)
        _.each(res, function(val, prop) {
            if (!val) delete res[prop]
        })
        callback(null, res)
    })
})

/**
 * Find data with retry
 *
 * @see exports.extract
 */
exports.extractWithRetry = thunkify(function(url, callback) {
    var op = retry.operation({retries: 2})

    op.attempt(function(attempt) {
        exports.extract(url)(function(err, data) {
            if (op.retry(err)) return
            callback(err ? op.mainError() : null, data)
        })
    })
})

/**
 * Fetch website document, extract some tags, extract article.
 *
 * @param {String} url
 * @param {Function} callback
 */
function fetchData(url, callback) {
    var req

    callback = _.once(callback)

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
            if (res.statusCode != 200) return req.emit('error', new Error('Bad status code'))
            if (!res.headers || !/html/i.test(res.headers['content-type'])) return callback()

            var tags, article
            var converter = new CharsetConverter(req, res)

            function done() {
                if (tags && article) callback(null, tags, article)
            }

            req
                .pipe(converter.getStream())
                .on('error', callback)
                .pipe(tagsExtractor(function(data) {
                    tags = data
                    done()
                }))
                .on('error', callback)
                .pipe(articleExtractor(req.uri.href, function(data) {
                    article = data
                    done()
                }))
        })
}

/**
 * Find tags we need for later extractions.
 */
function tagsExtractor(callback) {
    var data = {img: [], link: [], meta: []}
    var stream

    stream = sax.createStream(false, {lowercase: true})
        .on('error', function() {
            stream._parser.error = null
            stream._parser.resume()
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

            callback(data)
        })

    return stream
}

/**
 * Extract article using readabilitySax.
 */
function articleExtractor(url, callback) {
    var options = {pageURL: url, html: true}

    return readabilitySax.createWritableStream(options, function(article) {
        article.html = entities.decodeHTML5(article.html.replace(/\s+/g, ' '))
        article.title = entities.decodeHTML5(article.title)
        article.url = url
        callback(article)
    })
}

/**
 * Find a site icon.
 */
function findIcon(tags, baseUrl) {
    var icons = []
    var icon

    // Find links with rel f.e. rel="apple-touch-icon"
    _.each(tags.link, function(link) {
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
    _.each(tags.img, function(img) {
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
function findImages(tags, baseUrl, minWidth, maxAmount) {
    var images

    // - Filter images without width or width less than min.
    // - Parse width attr to number.
    images = tags.img.filter(function(img) {
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
        _.find(tags.meta, function(meta) {
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

/**
 * Find description using different tags.
 * f.e.
 *  - description tag
 *  - meta tag with property sailthru:description
 */
function findDescription(tags) {
    var descr

    _.find(tags.meta, function(meta) {
        var attr = meta.attributes
        if (isDescription.test(attr.name) || isDescription.test(attr.property)) {
            descr = attr.content
            return true
        }
    })

    return descr && entities.decodeHTML5(descr).trim()
}

/**
 * Find tags/keywords using different tags
 * f.e.
 *  - meta tag keywords
 *  - meta tag with property sailthru:tags, article:tag
 */
function findKeywords(tags) {
    var keywords = ''

    tags.meta.forEach(function(meta) {
        var attr = meta.attributes

        // Collect tags
        if (isKeywords.test(attr.name) || isKeywords.test(attr.property)) {
            keywords += ',' + attr.content
        }
    })

    keywords = entities.decodeHTML5(keywords)
    keywords = keywords.split(',')
    keywords = keywords.map(function(keyword) {
        return keyword.toLowerCase().trim()
    })
    keywords = _.compact(keywords)
    keywords = _.uniq(keywords)

    return keywords
}
