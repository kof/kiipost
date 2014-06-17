'use strict'

var m = require('mongoose')
var _article = require('./_article')

var article = new m.Schema(_article)

article.index({tags: 1, pubDate: -1})

module.exports = article
