'use strict'

var m = require('mongoose')
var _ = require('underscore')

var getTags = require('../helpers/getTags')

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
        var tagsData = yield getTags(user._id)
        var query = {$or: []}

        tagsData.forEach(function(data) {
            query.$or.push({tags: {$all: data.tags}})
        })

        this.body = yield m.model('article')
            .find(query)
            .sort({pubDate: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .select({summary: 1, pubDate: 1, title: 1, url: 1, images: 1, icon: 1,
                enclosures: 1})
            .exec()
    }
}
