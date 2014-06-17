'use strict'

var m = require('mongoose')

/**
 * Read saved memos.
 */
exports.read = function *() {
    this.body = yield m.model('article')
        .findById(this.params.id)
        .exec()
}
