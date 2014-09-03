'use strict'

var m = require('mongoose')
var _ = require('underscore')

var tagsHelper = require('api/articles/helpers/tags')
var queue = require('api/queue')

var RETURN_PROPERTIES = {text: 1, createdAt: 1, tweetId: 1, 'articles.title': 1,
    'articles.url': 1, 'articles.summary': 1, 'articles.images': 1, 'articles.icon': 1,
    'articles.enclosures': 1}

/**
 * Read memos.
 */
exports.read = function* () {
    if (this.query.relatedToArticle || this.query.relatedToMemo) yield readRelatedMemos.call(this)
    else yield readAllMemos.call(this)
}

/**
 * Read memos which can bring passed article to the user.
 */
function readRelatedMemos() {
    return function* () {
        var articleId = this.query.relatedToArticle
        var memoId = this.query.relatedToMemo
        var userId = this.session.user._id
        var article

        if (articleId) {
            article = yield m.model('article')
                .findById(articleId)
                .select({tags: 1})
                .lean()
                .exec()
        } else {
            var memo = yield m.model('memo')
                .findById(memoId)
                .select({'articles.tags': 1})
                .lean()
                .exec()

            if (memo) article = memo.articles[0]
        }

        if (!article) return this.body = []

        var tagsData = yield tagsHelper.get(userId)
        if (!tagsData.length) return this.body = []

        var memoIds = []
        _(tagsData).each(function(data) {
            var matches = 0
            if (data.memo._id == memoId) return
            _(data.tags).each(function(tag) {
                if (_(article.tags).contains(tag)) matches++
            })
            if (matches == data.tags.length) memoIds.push(data.memo._id)
        })

        this.body = yield m.model('memo')
            .find({_id: {$in: memoIds}})
            .sort({createdAt: -1})
            .skip(this.query.skip)
            .limit(this.query.limit)
            .select(RETURN_PROPERTIES)
            .lean()
            .exec()
    }
}

// Map of users which required a refresh of twitter data.
var refreshing = {}

/**
 * Read all memos.
 */
function readAllMemos() {
    return function* () {
        var user = yield m.model('user')
            .findById(this.session.user._id)
            .select({processing: 1})
            .lean()
            .exec()

        var retry = false

        // We need to avoid that frontend retries to refresh data over and over,
        // when sync is finished before the next try.
        // XXX this can't scale
        if (this.query.refresh && !refreshing[user._id]) {
            retry = true
            refreshing[user._id] = true
            yield queue.enqueue('TwitterSync', {userId: user._id, block: user._id})
        }

        if (retry || user.processing.TwitterSync) {
            this.status = 'service unavailable'
            this.set('retry-after', 2)
        } else {
            delete refreshing[user._id]

            this.body = yield m.model('memo')
                .find({userId: user._id})
                .sort({createdAt: -1})
                .skip(this.query.skip)
                .limit(this.query.limit)
                .select(RETURN_PROPERTIES)
                .lean()
                .exec()
        }
    }
}
