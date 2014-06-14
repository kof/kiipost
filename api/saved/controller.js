'use strict'

var m = require('mongoose')

/**
 * Read saved memos.
 */
exports.read = function *() {
    this.body = yield m.model('memo')
        .find({userId: this.session.user._id})
        .sort({createdAt: -1})
        .skip(this.query.skip)
        .limit(this.query.limit)
        .exec()
}
