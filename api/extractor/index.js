'use strict'

var _ = require('underscore')
var _s = require('underscore.string')
var retry = require('retry')
var thunkify = require('thunkify')
var co = require('co')

var fetch = require('./fetch')
var extractArticle = require('./article').extract
var extractHtmlData = require('./htmlData').extract
var extractKeywords = require('./keywords').extract
var processImages = require('./image').process
var extractEntities = require('./entities').extract

var conf = require('api/conf')

var MIN_IMAGE_WIDTH = 200
var MAX_IMAGES_AMOUNT = 5

/**
 * Extract icon and a big image from a website.
 *
 * @param {String} url
 * @param {Object} [options]
 * @param {String} [options.memo] memo text
 * @param {String} [options.title] title from rss (is better than html title tag?)
 * @param {Function} callback
 */
exports.extract = function(url, options) {
    return function* () {
        var data = yield fetch(url)
        var article = extractArticle(data.url, data.html)
        if (!article) return {}
        if (!options) options = {}
        var res = {}
        res.title = options.title || article.title
        res.score = article.score
        res.url = article.url
        var htmlData = extractHtmlData(data.url, data.html, {
            minImageWidth: MIN_IMAGE_WIDTH,
            maxImagesAmount: MAX_IMAGES_AMOUNT
        })
        res.icon = htmlData.icon
        res.images = yield processImages(htmlData.images, {minWidth: MIN_IMAGE_WIDTH})
        // TODO better summary generation #81
        res.summary = _s.prune(htmlData.description || article.text, 250, '')
        res.description = article.html
        res.tags = yield getCompoundTags({
            title: res.title,
            text: article.text,
            memo: options.memo
        })
        return res
    }
}

/**
 * Find data with retry
 *
 * @see exports.extract
 */
exports.extractWithRetry = thunkify(function(url, options, callback) {
    var op = retry.operation({retries: 1})

    op.attempt(function(attempt) {
        co(exports.extract(url))(function(err, data) {
            if (op.retry(err)) return
            callback(err ? op.mainError() : null, data)
        })
    })
})

/**
 * Get unified array of tags from different sources, sorted by relevance.
 *
 * Order of sources sorted by decreasing relevance:
 *
 * 1. memo text
 * 2. article title
 * 3. article text entities
 * 4. article text keywords sorted by decreasing density
 *
 * @param {Object} options
 * @param {String} options.title
 * @param {String} options.text
 * @param {String} [options.memo]
 * @return {Array}
 */
function getCompoundTags(options) {
    return function* () {
        var tags = []

        var topArticleTextKeywords = []
        // Temp for https://github.com/NaturalNode/natural/issues/175
        try {
            topArticleTextKeywords = extractKeywords(options.text)
        } catch(err) {}

        extractKeywords(options.title, {minDensity: 0}).forEach(function(keyword) {
            if (topArticleTextKeywords.indexOf(keyword) >= 0) {
                tags.push(keyword)
            }
        })

        tags = tags.concat(yield extractEntities(options.text))

        tags = tags.concat(topArticleTextKeywords)

        extractKeywords(options.memo, {minDensity: 0}).forEach(function(keyword) {
            if (tags.indexOf(keyword) >= 0) {
                tags.unshift(keyword)
            }
        })

        tags = _(tags).uniq()

        return tags
    }
}

