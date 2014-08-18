var _ = require('underscore')
var m = require('mongoose')

// Amount of tags we take from each saved article to find new articles.
var SEARCH_TAGS_AMOUNT = 3

// Amount of tags considered for calculating the dna.
var DNA_TAGS_AMOUNT = 5

// Min fequency tag should be used across different memos, to get into the dna.
var DNA_MIN_FREQ = 3

/**
 * Get user tags for articles lookup.
 *
 * @param {ObjectId} userId
 * @param {Boolean} [full] return full memos and articles
 * @return {Array}
 */
module.exports = function(userId, full) {
    return function* () {
        var memos = yield m.model('memo')
            .find({userId: userId})
            .select(full ? {} : {'articles.tags': 1})
            .lean()
            .exec()


        // Create a tags frequency map.
        var tagsFreqMap = {}
        _(memos).each(function(memo) {
            var article = memo.articles[0]
            if (!article || !article.tags.length) return
            var tags = _(article.tags).first(DNA_TAGS_AMOUNT)
            _(tags).each(function(tag) {
                if (tagsFreqMap[tag]) tagsFreqMap[tag]++
                else tagsFreqMap[tag] = 1
            })
        })
        // Create a tags dna array.
        var dna = []
        _(tagsFreqMap).each(function(freq, tag) {
            if (freq >= DNA_MIN_FREQ) dna.push(tag)
        })

        var map = {}
        var data = []

        _(memos).each(function(memo) {
            var article = memo.articles[0]

            // Filter memos where tags amount is too low.
            if (!article || article.tags.length < SEARCH_TAGS_AMOUNT) return

            // Verify if this tags fit our dna, don't use them if not
            var maybeDna = _(article.tags).first(DNA_TAGS_AMOUNT)
            if (!_.intersection(maybeDna, dna).length) return

            var searchTags = _(article.tags).first(SEARCH_TAGS_AMOUNT).sort()
            // Create map to avoid duplicates
            var tagsStr = String(searchTags)
            if (!map[tagsStr]) {
                map[tagsStr] = true
                data.push({
                    tags: searchTags,
                    memo: memo
                })
            }
        })

        return data
    }
}
