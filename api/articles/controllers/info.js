'use strict'

var m = require('mongoose')
var _ = require('underscore')

var getTags = require('../helpers/getTags')

/**
 * Read saved memos.
 */
exports.read = function *() {
    var userId = this.session.user._id
    var articleId = this.params.id

    var tagsData = yield getTags(userId, true)

    if (articleId) {
        var article
        article = yield m.model('article')
            .findById(articleId)
            .select({tags: 1})
            .exec()

        tagsData = tagsData.filter(function(data) {
            var hasAll = true

            data.tags.forEach(function(tag) {
                if (_.isEmpty(article.tags) || article.tags.indexOf(tag) < 0) hasAll = false
            })

            return hasAll
        })
    }

    this.body = tagsData
}
