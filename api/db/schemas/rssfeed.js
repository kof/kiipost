'use strict'

var m = require('mongoose')

var rssFeed

rssFeed = new m.Schema({
    feed: {
        type: String,
        required: true
    },
    title: String,
    tags: Array,
    website: String,
    lang: String,
    descr: String,
    icon: String,
    failsCounter: Number,
    lastSync: Date,
    feedly: {
        subscribers: Number,
        estimatedEngagement: Number,
        score: Number
    }
})

rssFeed.index({feed: 1}, {unique: true});

module.exports = rssFeed
