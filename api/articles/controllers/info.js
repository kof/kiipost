'use strict'

var m = require('mongoose')
var _ = require('underscore')

var getTags = require('../helpers/getTags')

/**
 * Read saved memos.
 */
exports.read = function *() {
    var articleId = this.params.id
    var article

    article = yield m.model('article')
        .findById(articleId)
        .lean()
        .exec()

    if (!article) {
        this.status = 'bad request'
        this.body = 'Bad article id.'
        return
    }

    var userId = this.session.user._id
    var tagsData = yield getTags(userId, true)

    tagsData = tagsData.filter(function(data) {
        if (_.intersection(data.tags, article.tags).length === data.tags.length) {
            return true
        }
    })

    this.body = {
        article: article,
        explains: tagsData
    }
}
