'use strict'

var m = require('mongoose')
var _ = require('underscore')

// Amount of tags we take from each saved article to find new articles.
var TAGS_AMOUNT = 3

/**
 * Read saved memos.
 */
exports.read = function *() {
    var user

    user = yield m.model('user')
        .findById(this.session.user._id)
        .select({processing: 1})
        .exec()

    if (user.processing.TwitterSync) {
        this.status = 'service unavailable'
        this.set('retry-after', 5)
    } else {
        var memos

        memos = yield m.model('memo')
            .find({'articles.tags.0': {$exists: true}})
            .select({'articles.tags': 1})
            .exec()

        var query = {$or: []}
        var map = {}

        memos.forEach(function(memo) {
            var article = memo.articles[0]
            if (!article || article.tags.length < TAGS_AMOUNT) return
            var tags = article.tags.splice(0, TAGS_AMOUNT).sort()
            // Create map to avoid duplicates
            map[tags.toString()] = tags
        })

        _.each(map, function(tags) {
            query.$or.push({tags: {$all: tags}})
        })

        this.body = yield m.model('article')
            .find(query)
            .sort({pubDate: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .select({summary: 1, pubDate: 1, title: 1, url: 1, images: 1, icon: 1, enclosures: 1})
            .exec()
    }
}
