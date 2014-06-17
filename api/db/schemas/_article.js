'use strict'

var m = require('mongoose')

var ObjectId = m.Schema.ObjectId

module.exports = {
    feedId: ObjectId,
    url: String,
    pubDate: Date,
    icon: String,
    title: String,
    summary: String,
    description: String,
    score: Number,
    tags: [String],
    categories: [String],
    images: [String],
    enclosures: [new m.Schema({
        url: String,
        type: String,
        length: Number
    }, {_id: false})]
}
