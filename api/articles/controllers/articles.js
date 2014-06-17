'use strict'

var m = require('mongoose')

// Amount of tags we take from each saved article to find new articles.
var REDUCE_USER_TAGS = 3

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

        var query
        query = {$or: memos.map(function(memo) {
            var tags = memo.articles[0].tags.splice(0, REDUCE_USER_TAGS)
            return {tags: {$all: tags}}
        })}

        this.body = yield m.model('article')
            .find(query)
            .sort({pubDate: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .select({summary: 1, pubDate: 1, title: 1, url: 1, images: 1, icon: 1})
            .exec()
    }
}
