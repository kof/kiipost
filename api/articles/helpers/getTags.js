var _ = require('underscore')
var m = require('mongoose')

// Amount of tags we take from each saved article to find new articles.
var TAGS_AMOUNT = 3

/**
 * Get user tags for articles lookup.
 *
 * @param {ObjectId} userId
 * @param {Boolean} [full] return full memos and articles
 * @return {Array}
 */
module.exports = function(userId, full) {
    return function* () {
        var memos

        memos = yield m.model('memo')
            .find({userId: userId})
            .select(full ? {} : {'articles.tags': 1})
            .exec()

        var map = {}, data = []

        memos.forEach(function(memo) {
            var article = memo.articles[0]
            if (!article || article.tags.length < TAGS_AMOUNT) return
            var tags = article.tags.splice(0, TAGS_AMOUNT).sort()
            // Create map to avoid duplicates
            var tagsStr = tags.toString()
            if (!map[tagsStr]) {
                map[tagsStr] = tags
                data.push({
                    tags: tags,
                    memo: memo
                })
            }
        })

        return data
    }
}
