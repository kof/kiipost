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
var MemoModel = require('app/components/memo/models/Memo')

var MemoView = require('app/screens/memos/views/Memo')

var app = require('app')

function HorizontalStream() {
    View.apply(this, arguments)
    this.initialize()
}

inherits(HorizontalStream, View)
module.exports = HorizontalStream

HorizontalStream.DEFAULT_OPTIONS = {
    title: {height: 70},
    z: 0,
    urlRoot: null,
    type: null,
    categoryTitle: null,
    models: null
}

HorizontalStream.prototype.initialize = function() {
    var o = this.options
    var ItemView = o.type == 'articles' ? ArticleView : MemoView
    var size = ItemView.getSize()

    this.collection = new StreamCollection(null, {
        urlRoot: o.urlRoot,
        model: o.type == 'articles' ? ArticleModel : MemoModel,
        limit: 10
    })

    this.containerSize = [size[0], size[1] + o.title.height]
    this.container = new ContainerSurface({
        classes: ['horizontal-stream']
    })

    this.category = new Surface({
        classes: ['category'],
        content: o.categoryTitle,
        size: [undefined, o.title.height],
        properties: {lineHeight: o.title.height + 'px'}
    })
    this.container.add(new Modifier({
        transform: Transform.translate(0, 0, o.z)
    })).add(this.category)

    this.stream = new StreamView({
        scrollview: {direction: 0},
        ItemView: ItemView,
        collection: this.collection,
        models: o.models,
        classes: [o.type],
        context: app.context,
        back: false
    })
    this.container.add(new Modifier({
        transform: Transform.translate(0, o.title.height, o.z)
    })).add(this.stream)
}

HorizontalStream.prototype.load = function() {
     this.stream.load({reset: true}, function() {
        if (this.collection.length) this.container.setSize(this.containerSize)
    }.bind(this))
}
