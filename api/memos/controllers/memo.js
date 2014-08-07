'use strict'

var m = require('mongoose')

/**
 * Read saved memo.
 */
exports.read = function* () {
    var memo

    memo = yield m.model('memo')
        .findById(this.params.id)
        .lean()
        .exec()

    this.body = memo || {}
}


/**
 * Create a memo.
 */
exports.create = function* () {
    this.body = yield m.model('memo')
        .create(this.request.body)
}
