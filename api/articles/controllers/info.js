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
        .exec()

    if (!article) {
        this.status = 'bad request'
        this.body = 'Bad article id.'
        return
    }

    var userId = this.session.user._id
    var tagsData = yield getTags(userId, true)

    tagsData = tagsData.filter(function(data) {
        var hasAll = true

        data.tags.forEach(function(tag) {
            if (article.tags.indexOf(tag) < 0) hasAll = false
        })

        return hasAll
    })

    this.body = {
        article: article,
        explains: tagsData
    }
}
