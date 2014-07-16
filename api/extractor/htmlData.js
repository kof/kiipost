'use strict'

var _ = require('underscore')
var _s = require('underscore.string')
var url = require('url')
var htmlParser = require('htmlparser2')
var entities = require('entities')

var conf = require('api/conf')

var isIcon = /icon/i
var isLogo = /logo/i
var isIco = /\.ico/i // They are too small for our purpose.
var isDataImage = /data:image\//i
var isOgImage = /og:image/i
var isDescription = /description/i
var isKeywords = /keywords|tag|tags/i

/**
 * Extract all data we can get from html.
 *
 * @param {String} url
 * @param {String} html
 * @param {Object} options
 * @return {Object}
 */
exports.extract = function(url, html, options) {
    var tags = extractTags(html)

    return {
        icon: findIcon(tags, url),
        images: findImages(tags, url, options),
        description: findDescription(tags),
        keywords: findKeywords(tags)
    }
}

/**
 * Find tags we need for later extractions.
 */
function extractTags(html) {
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
function findImages(tags, baseUrl, options) {
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
        if (img.width >= options.minImageWidth &&
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

    return _(images).first(options.maxImagesAmount)
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

    return descr && _s.stripTags(entities.decodeHTML5(descr).trim())
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
