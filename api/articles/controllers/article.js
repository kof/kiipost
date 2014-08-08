'use strict'

var m = require('mongoose')

/**
 * Read saved article.
 */
exports.read = function* () {
    var article;

    article = yield m.model('article')
        .findById(this.params.id)
        .lean()
        .exec()

    this.body = article || {}
}
