'use strict'

var m = require('mongoose')

var ObjectId = m.Schema.ObjectId
var memo

memo = new m.Schema({
    userId: ObjectId,
    tweetId: String,
    text: String,
    urls: [String],
    createdAt: Date,
    articles: [new m.Schema({
        url: String,
        icon: String,
        title: String,
        description: String,
        score: Number,
        html: String,
        tags: [String],
        images: [String]
    }, {_id: false})]
})

memo.index({userId: 1, createdAt: -1})

module.exports = memo
