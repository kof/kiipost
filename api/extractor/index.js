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

var conf = require('api/conf')

var MIN_IMAGE_WIDTH = 200
var MAX_IMAGES_AMOUNT = 5

/**
 * Extract icon and a big image from a website.
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.extract = function(url) {
    return function* () {
        var data = yield fetch(url)
        var article = extractArticle(data.url, data.html)
        if (!article) return {}
        var res = _.pick(article, 'title', 'score', 'url')
        var htmlData
        htmlData = extractHtmlData(data.url, data.html, {
            minImageWidth: MIN_IMAGE_WIDTH,
            maxImagesAmount: MAX_IMAGES_AMOUNT
        })
        res.icon = htmlData.icon
        res.images = yield processImages(htmlData.images, {minWidth: MIN_IMAGE_WIDTH})
        res.summary = _s.prune(htmlData.description || article.text, 250, '')
        res.description = article.html
        // Temp for https://github.com/NaturalNode/natural/issues/175
        var extractedKeywords = []
        try {
            extractedKeywords = extractKeywords(article.text)
        } catch(err) {}
        res.tags = _.uniq(extractedKeywords.concat(htmlData.keywords))
        return res
    }
}

/**
 * Find data with retry
 *
 * @see exports.extract
 */
exports.extractWithRetry = thunkify(function(url, callback) {
    var op = retry.operation({retries: 1})

    op.attempt(function(attempt) {
        co(exports.extract(url))(function(err, data) {
            if (op.retry(err)) return
            callback(err ? op.mainError() : null, data)
        })
    })
})



