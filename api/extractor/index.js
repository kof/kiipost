'use strict'

var request = require('superagent')
var _ = require('underscore')
var _s = require('underscore.string')
var url = require('url')
var htmlParser = require('htmlparser2')
var readabilitySax = require('readabilitySAX')
var retry = require('retry')
var thunkify = require('thunkify')
var entities = require('entities')
var es = require('event-stream')

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

var noop = function() {}

/**
 * Extract icon and a big image from a website.
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.extract = thunkify(function(url, callback) {
    fetchData(url, function(err, tags, article) {
        var res = {}
        if (err) err.url = url
        if (err || !tags || !article) return callback(err, res)
        res = _.pick(article, 'title', 'score', 'url')
        res.icon = findIcon(tags, url)
        res.images = findImages(tags, url, MIN_IMAGE_WIDTH, MAX_IMAGES_AMOUNT)
        res.summary = _s.prune(_s.stripTags(findDescription(tags) || article.html).trim(), 250, '')
        res.description = article.html
        res.tags = findKeywords(tags)
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
    var req, done

    done = _.once(function(err) {
        if (err && req) req.abort()
        callback.apply(this, arguments)
    })

    req = request
        .get(url)
        .set('user-agent', conf.request.agent)
        .set('accept', conf.request.accept)
        .timeout(conf.request.timeout)
        .buffer(false)
        // Avoid default parsing to utf-8
        // TODO charset converter here.
        .parse(noop)
        .on('error', done)
        .on('response', function(res) {
            if (!res.ok) return done(new Error('Bad status code'))
            if (!/text/i.test(res.type)) return done(new Error('Bad content type'))

            var timeoutId

            runExtractors(req, res, function() {
                clearTimeout(timeoutId)
                done.apply(this, arguments)
            })

            // For the case some extractors stuck.
            timeoutId = setTimeout(function() {
                done(new Error('Extractor timeout'))
            }, 100000)
        })
        .end()

    req.agent()
}

/**
 * Run all converters/extractors.
  */
function runExtractors(req, res, callback) {
    var tags = [], article

    function done() {
        if (tags && article) callback(null, tags, article)
    }

    var charsetConverter = new CharsetConverter(res).getStream()

    var tagsStream
    tagsStream = tagsExtractor(function(data) {
        tags = data
        done()
    })

    var readabilityStream
    readabilityStream = articleExtractor(req.url, function(data) {
        article = data
        done()
    })

    res
        .pipe(charsetConverter)
        .on('error', callback)
        .pipe(tagsStream)
        .pipe(readabilityStream)
}

/**
 * Find tags we need for later extractions.
 */
function tagsExtractor(callback) {
    var data = {img: [], link: [], meta: []}
    var parser

    parser = new htmlParser.Parser({
        onopentag: function(name, attr){
            if (data[name]) {
                data[name].push({attributes: attr || {}})
            }
        }
    })

    return es.through(
        function(data) {
            parser.write(data)
            this.emit('data', data)
        },
        function() {
            callback(data)
            this.emit('end')
        }
    )
}
/**
 * Extract article using readabilitySax.
 */
function articleExtractor(url, callback) {
    var Readability = readabilitySax.Readability
    var Parser = htmlParser.Parser
    var CollectingHandler = htmlParser.CollectingHandler

    var readability = new Readability({pageURL: url, type: 'html'})
    var handler = new CollectingHandler(readability)
    var parser = new Parser(handler, {lowerCaseTags: true})

    return es.through(
        function(data) {
            parser.write(data)
            this.emit('data', data)
        },
        function() {
            for(
                var skipLevel = 1;
                readability._getCandidateNode().info.textLength < 250 && skipLevel < 4;
                skipLevel++
            ){
                readability.setSkipLevel(skipLevel)
                handler.restart()
            }

            var article = readability.getArticle()
            article.html = entities.decodeHTML5(article.html.replace(/\s+/g, ' '))
            article.title = entities.decodeHTML5(article.title)
            article.url = url
            callback(article)
            this.emit('end')
        }
    )
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
            if (isOgImage.test(attr.property) && attr.content) {
                images.push(attr.content.trim())
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
    // Filter too long keywords in case its just text.
    keywords = keywords.filter(function(keyword) {
        return keyword.length < 20
    })

    return keywords
}
