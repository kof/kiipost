'use strict'

var m = require('mongoose')

/**
 * Read saved article.
 */
exports.read = function *() {
    var article;

    article = yield m.model('article')
        .findById(this.params.id)
        .exec()

    this.body = article || {}
}
