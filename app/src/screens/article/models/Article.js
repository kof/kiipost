define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')
    var backbone = require('backbone')

    function Article() {
        this.url = '/api/article'
        Article.super_.apply(this, arguments)
    }

    inherits(Article, backbone.Model)
    module.exports = Article
})
