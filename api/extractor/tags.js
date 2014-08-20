var _ = require('underscore')

var extractEntities = require('./entities').extract
var extractKeywords = require('./keywords').extract

/**
 * Get unified array of tags from different sources, sorted by relevance.
 *
 * Order of sources sorted by decreasing relevance:
 *
 * 1. All keywords from title which are also in memo and in article text entities.
 * 2. All keywords from title which are also in article text entities.
 * 3. All keywords from memo which are also in article text entities.
 * 4. All keywords from title which are also in memo and in top article text keywords.
 * 5. Article text entities.
 * 6. Top article text keywords sorted by decreasing density.
 *
 * @param {Object} options
 * @param {String} options.title article title
 * @param {String} options.text article text
 * @param {String} [options.memo]
 * @return {Array}
 */
exports.extract = function(options) {
    return function* () {
        var tags = []
        var titleKeywords = extractKeywords(options.title, {minDensity: 0})
        var memoKeywords = extractKeywords(options.memo, {minDensity: 0})
        var textEntities = yield extractEntities(options.text)
        var textKeywordsVerbose = extractKeywords(options.text, {verbose: true})
        var textKeywords = _(textKeywordsVerbose).pluck('tag')
        var topTextKeywordsVerbose = getTopKeywords(textKeywordsVerbose)
        var topTextKeywords = _(topTextKeywordsVerbose).pluck('tag')

        // 1.
        _(titleKeywords).each(function(keyword) {
            if (memoKeywords.indexOf(keyword) >= 0 && textEntities.indexOf(keyword) >= 0) {
                tags.push(keyword)
            }
        })

        // 2.
        _(titleKeywords).each(function(keyword) {
            if (textEntities.indexOf(keyword) >= 0) tags.push(keyword)
        })

        // 3.
        _(memoKeywords).each(function(keyword) {
            if (textEntities.indexOf(keyword) >= 0) tags.push(keyword)
        })

        // 4.
        _(titleKeywords).each(function(keyword) {
            if (memoKeywords.indexOf(keyword) >= 0 && topTextKeywords.indexOf(keyword) >= 0) {
                tags.push(keyword)
            }
        })

        // 5.
        tags = tags.concat(textEntities)

        // 6.
        tags = tags.concat(topTextKeywords)

        tags = _(tags).uniq()

        return tags
    }
}

// Min length of the keywords array which land in tags.
var KEYWORDS_MIN_LENGHT = 5

// We try to get only tags which have higher density number than this.
// If we can't satisfy the min length when applied this filter,
// we reduce this number by 1 until it is 1.
var KEYWORDS_START_DENSITY = 5

/**
 * Get top keywords based on density.
 */
function getTopKeywords(keywords) {
    for (var density = KEYWORDS_START_DENSITY; density > 0; density--) {
        var newKeywords = keywords.filter(function(obj) {
            return obj.density >= density
        })
        if (newKeywords.length >= KEYWORDS_MIN_LENGHT) return newKeywords
    }
}
