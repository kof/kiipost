'use strict'

var inherits = require('inherits')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')
var ContainerSurface = require('famous/surfaces/ContainerSurface')

var StreamView = require('app/components/stream/views/Stream')
var ArticleView = require('app/components/article/views/Article')
var StreamCollection = require('app/components/stream/collections/Stream')
var ArticleModel = require('app/components/article/models/Article')

var app = require('app')

function RelatedArticles() {
    View.apply(this, arguments)
    this.initialize()
}

inherits(RelatedArticles, View)
module.exports = RelatedArticles

RelatedArticles.DEFAULT_OPTIONS = {
    title: {height: 70},
    z: 0
}

RelatedArticles.prototype.initialize = function() {
    var o = this.options
    var size = ArticleView.getSize()

    this.collection = new StreamCollection(null, {
        urlRoot: '/api/articles',
        model: ArticleModel,
        limit: 10
    })

    this.containerSize = [size[0], size[1] + o.title.height]
    this.container = new ContainerSurface({
        classes: ['related-articles']
    })

    this.category = new Surface({
        classes: ['category'],
        content: 'Related articles',
        size: [undefined, o.title.height],
        properties: {lineHeight: o.title.height + 'px'}
    })
    this.container.add(new Modifier({
        transform: Transform.translate(0, 0, o.z)
    })).add(this.category)

    this.stream = new StreamView({
        scrollview: {direction: 0},
        ItemView: ArticleView,
        collection: this.collection,
        classes: ['articles'],
        context: app.context,
        back: false
    })
    this.container.add(new Modifier({
        transform: Transform.translate(0, o.title.height, o.z)
    })).add(this.stream)
}

RelatedArticles.prototype.load = function(options) {
     this.stream.load(options, function() {
        if (this.collection.length) this.container.setSize(this.containerSize)
    }.bind(this))
}
