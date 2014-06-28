'use strict'

var m = require('mongoose')

/**
 * Read saved memo.
 */
exports.read = function *() {
    var memo

    memo = yield m.model('memo')
        .findById(this.params.id)
        .exec()

    this.body = memo || {}
}
