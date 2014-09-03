'use strict'

var inherits = require('inherits')
var Model = require('backbone').Model

function Tweet() {
    this.url = '/api/tweets'
    Model.apply(this, arguments)
}

inherits(Tweet, Model)
module.exports = Tweet
