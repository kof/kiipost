'use strict'

var m = require('mongoose')
var _article = require('./_article')

var article = new m.Schema(_article)

module.exports = article
