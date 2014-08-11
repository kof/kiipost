'use strict'

var m = require('mongoose')
var _ = require('underscore')
var ms = require('ms')
var lru = require('lru-cache')

var getTags = require('../helpers/getTags')

var cache = lru({maxAge: ms('8h')})

/**
 * Discover articles.
 *
 * TODO move caching to some database when scaling the process.
 */
exports.read = function* () {
    if (this.query.relatedTo) yield readRelatedArticles.call(this)
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
            this.set('retry-after', 5)
        } else {
            var tagsData = yield getTags(user._id)
            var query = {$or: []}

            tagsData.forEach(function(data) {
                query.$or.push({tags: {$all: data.tags}})
            })

            var key = JSON.stringify([query, skip, limit])
            var articles = cache.get(key)

            if (articles) {
                this.body = articles
            } else {
                if (loading[key]) {
                    this.status = 'service unavailable'
                    this.set('retry-after', 5)

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
        var articleId = this.query.relatedTo
        var skip = this.query.skip
        var limit = this.query.limit

        var article = yield m.model('article')
            .findById(articleId)
            .select({tags: 1})
            .lean()
            .exec()

        var query = {
            _id: {$ne: articleId},
            tags: {$all: _(article.tags).first(3)}
        }

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
