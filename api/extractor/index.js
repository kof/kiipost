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
var co = require('co')

var conf = require('api/conf')

var convertCharset = require('./convertCharset')
var bufferParser = require('./bufferParser')
var getImageSize = require('./getImageSize')

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
exports.extract = co(function* (url) {
    var data = yield fetchData(url)
    var res = {}
    if (!data.tags || !data.article) return res
    res = _.pick(data.article, 'title', 'score', 'url')
    res.icon = findIcon(data.tags, url)
    res.images = findImages(data.tags, url, MIN_IMAGE_WIDTH, MAX_IMAGES_AMOUNT)
    yield largeImageFirst(res.images)
    res.summary = _s.prune(_s.stripTags(findDescription(data.tags) || data.article.html).trim(), 250, '')
    res.description = data.article.html
    res.tags = findKeywords(data.tags)
    return res
})

/**
 * Find data with retry
 *
 * @see exports.extract
 */
exports.extractWithRetry = thunkify(function(url, callback) {
    var op = retry.operation({retries: 2})

    op.attempt(function(attempt) {
        exports.extract(url, function(err, data) {
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
    var timeoutId

    done = _.once(callback)

    req = request
        .get(url)
        .set('user-agent', conf.request.agent)
        .set('accept', conf.request.accept)
        .timeout(conf.request.timeout)
        .parse(bufferParser)
        .agent(undefined)
        .buffer(true)
        .on('error', done)
        .end(function(res) {
            if (!res.ok) return done(new Error('Bad status code'))
            if (!/text/i.test(res.type)) return done(new Error('Bad content type'))

            var data = {}
            res.body = convertCharset(res, res.body)
            data.tags = tagsExtractor(res.body)
            data.article = articleExtractor(req.url, res.body)
            clearTimeout(timeoutId)
            done(null, data)
        })

    // For the case some extractors stuck.
    timeoutId = setTimeout(function() {
        done(new Error('Extractor timeout'))
    }, conf.request.timeout + 10000)
}

fetchData = thunkify(fetchData)


/**
 * Find tags we need for later extractions.
 */
function tagsExtractor(html) {
    var data = {img: [], link: [], meta: []}

    new htmlParser.Parser({
        onopentag: function(name, attr){
            if (data[name]) {
                data[name].push({attributes: attr || {}})
            }
        }
    }).write(html)

    return data
}

/**
 * Extract article using readabilitySax.
 */
function articleExtractor(url, data) {
    var Readability = readabilitySax.Readability
    var Parser = htmlParser.Parser
    var CollectingHandler = htmlParser.CollectingHandler

    var readability = new Readability({pageURL: url, type: 'html'})
    var handler = new CollectingHandler(readability)
    var parser = new Parser(handler, {lowerCaseTags: true})

    parser.write(data)

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

    return article
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

    function parseNumber(num) {
        var num = parseInt(num, 10)
        return isNaN(num) ? 0 : num
    }

    // - Create image objects.
    // - Parse width attr to number.
    images = tags.img.map(function(image) {
        var a = image.attributes

        return {
            url: a.src ? a.src.trim() : '',
            width: parseNumber(a.width),
            height: parseNumber(a.height)
        }
    })

    // - Filter small images.
    // - Filter data urls.
    images = images.filter(function(img) {
        if (img.width >= minWidth &&
            img.url &&
            !isDataImage.test(img.url)) {
            return true
        }
    })

    // Add from meta og:image.
    _(tags.meta).find(function(meta) {
        var a = meta.attributes
        if (isOgImage.test(a.property) && a.content) {
            // We don't know the size yet.
            images.push({
                url: a.content.trim(),
                width: 0,
                height: 0
            })
            return true
        }
    })

    // Resolve urls.
    images.forEach(function(image) {
        image.url = url.resolve(baseUrl, image.url)
    })

    // Sort images by width ascending.
    images = _(images).sortBy(function(img) {
        return -(img.width + img.height)
    })

    // Remove duplicates.
    images = _(images).uniq(function(img) {
        return img.url
    })

    return _(images).first(maxAmount)
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

/**
 * Find an image which is big enough by checking real size.
 * Put it at first position to be used as main article image.
 *
 * @param {Array} images
 */
function largeImageFirst(images) {
    return function* () {
        for (var i = 0; i < images.length; i++) {
            var image = images[i]
            try {
                var size = yield getImageSize(image.url)
                if (size.width >= MIN_IMAGE_WIDTH) {
                    images.splice(i, 1)
                    size.url = image.url
                    images.unshift(size)
                    break;
                }
            // We ignore errors here because its optional.
            } catch(err) {}
        }
    }
}


