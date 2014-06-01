define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var backbone = require('backbone')
    var url = require('components/utils/url')

    function Article() {
        this.url = '/api/article'
        Article.super_.apply(this, arguments)
    }

    inherits(Article, backbone.Model)
    module.exports = Article

    Article.prototype.parse = function(data) {
        if (data.website) {
            data.hostname = url.parse(data.website).hostname
        }

        return data
    }
})
