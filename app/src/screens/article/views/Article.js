define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')

    var app = require('app')

    function Article() {
        View.apply(this, arguments)
        this.text = new Surface({
            content: 'text',
            classes: ['article']
        })
        this.add(this.text)
    }

    inherits(Article, View)
    module.exports = Article

    Article.DEFAULT_OPTIONS = {}
})
