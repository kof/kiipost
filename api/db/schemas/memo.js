'use strict'

var m = require('mongoose')
var _article = require('./_article')

var ObjectId = m.Schema.ObjectId
var memo

memo = new m.Schema({
    userId: ObjectId,
    tweetId: String,
    text: String,
    urls: [String],
    createdAt: Date,
    articles: [new m.Schema(_article, {_id: false})]
})

memo.index({userId: 1, createdAt: -1})

module.exports = memo
