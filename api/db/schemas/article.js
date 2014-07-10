'use strict'

var m = require('mongoose')
var _article = require('./_article')

var article = new m.Schema(_article)

article.index({tags: 1, pubDate: -1})
article.index({url: 1}, {unique: true})

module.exports = article
