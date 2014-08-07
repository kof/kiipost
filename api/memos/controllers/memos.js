'use strict'

var m = require('mongoose')

/**
 * Read saved memos.
 */
exports.read = function* () {
    var user

    user = yield m.model('user')
        .findById(this.session.user._id)
        .select({processing: 1})
        .lean()
        .exec()

    if (user.processing.TwitterSync) {
        this.status = 'service unavailable'
        this.set('retry-after', 5)
    } else {
        this.body = yield m.model('memo')
            .find({userId: user._id})
            .sort({createdAt: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .select({text: 1, createdAt: 1, tweetId: 1, 'articles.title': 1, 'articles.url': 1,
                'articles.summary': 1, 'articles.images': 1, 'articles.icon': 1,
                'articles.enclosures': 1})
            .lean()
            .exec()
    }
}
