'use strict'

var m = require('mongoose')
var _ = require('underscore')
var ms = require('ms')
var lru = require('lru-cache')

var tagsHelper = require('../helpers/tags')

var cache = lru({maxAge: ms('8h')})

/**
 * Discover articles.
 *
 * TODO move caching to some database when scaling the process.
 */
exports.read = function* () {
    if (this.query.relatedToArticle || this.query.relatedToMemo) yield readRelatedArticles.call(this)
    else yield readUserArticles.call(this)
}

var loading = {}

/**
 * Articles based on user memos.
 */
function readUserArticles() {
    return function* () {
        var userId = this.session.user._id
        var skip = this.query.skip
        var limit = this.query.limit

        var user = yield m.model('user')
            .findById(userId)
            .select({processing: 1})
            .lean()
            .exec()

        if (user.processing.TwitterSync) {
            this.status = 'service unavailable'
            this.set('retry-after', 2)
        } else {
            var tagsData = yield tagsHelper.get(user._id)

            if (tagsData.length) {
                var query = {$or: []}
                tagsData.forEach(function(data) {
                    query.$or.push({tags: {$all: data.tags}})
                })
                var key = JSON.stringify([query, skip, limit])
                var articles = cache.get(key)
            } else {
                articles = []
            }

            if (articles) {
                this.body = articles
            } else {
                if (loading[key]) {
                    this.status = 'service unavailable'
                    this.set('retry-after', 2)
                } else {
                    loading[key] = true
                    articles = yield findArticles({
                        query: query,
                        skip: skip,
                        limit: limit
                    })
                    cache.set(key, articles)
                    delete loading[key]
                    this.body = articles
                }
            }
        }
    }
}

/**
 * Articles related to the passed article.
 */
function readRelatedArticles() {
    return function* () {
        var articleId = this.query.relatedToArticle
        var memoId = this.query.relatedToMemo
        var skip = this.query.skip
        var limit = this.query.limit
        var article
        var tags

        if (articleId) {
            article = yield m.model('article')
                .findById(articleId)
                .select({tags: 1})
                .lean()
                .exec()

            if (article) tags = article.tags
        } else {
            var memo = yield m.model('memo')
                .findById(memoId)
                .select({'articles.tags': 1})
                .lean()
                .exec()

            if (memo && !_(memo.articles).isEmpty()) tags = memo.articles[0].tags
        }

        if (_(tags).isEmpty() || tags.length < tagsHelper.SEARCH_TAGS_AMOUNT) {
            this.body = []
            return
        }

        var query = {
            tags: {$all: _(tags).first(tagsHelper.SEARCH_TAGS_AMOUNT)}
        }
        if (articleId) query._id = {$ne: articleId}

        this.body = yield findArticles({
            query: query,
            skip: skip,
            limit: limit
        })
    }
}

/**
 * Execute articles search.
 */
function findArticles(options) {
    return function* () {
        return yield m.model('article')
            .find(options.query)
            .sort({pubDate: -1})
            .skip(options.skip)
            .limit(options.limit)
            .select({summary: 1, pubDate: 1, title: 1, url: 1, images: 1, icon: 1,
                enclosures: 1})
            .lean()
            .exec()
    }
}
