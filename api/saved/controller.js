'use strict'

var m = require('mongoose')

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
        this.body = yield m.model('memo')
            .find({userId: user._id})
            .sort({createdAt: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .exec()
    }
}
