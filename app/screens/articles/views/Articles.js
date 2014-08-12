'use strict'

var inherits = require('inherits')

var View = require('famous/core/View')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')

var EventProxy = require('app/components/famous/EventProxy')
var HeaderView = require('app/components/header/views/Header')
var StreamView = require('app/components/stream/views/Stream')
var MenuView = require('app/components/menu/views/Menu')
var JumperView = require('app/components/jumper/views/Jumper')
var ParallaxedBackgroundView = require('app/components/parallaxed-background/ParallaxedBackground')

var ArticleView = require('./Article')

var app = require('app')

function Articles() {
    View.apply(this, arguments)
    this.models = this.options.models
    this.initialize()
}

inherits(Articles, View)
module.exports = Articles

Articles.DEFAULT_OPTIONS = {
    models: null,
    collection: null
}

Articles.prototype.initialize = function() {
    this.background = new ParallaxedBackgroundView({context: app.context})
    this.add(this.background)

    this.header = new HeaderView({
        context: app.context,
        models: this.models
    })

    this.menu = new MenuView({selected: 'articles'})
    this.menu.pipe(new EventProxy(function(name, data, emit) {
        emit('menu:' + name, data)
    })).pipe(this._eventOutput)
    this.header.surface.add(this.menu)

    this.stream = new StreamView({
        ItemView: ArticleView,
        views: [this.header],
        collection: this.options.collection,
        classes: ['articles'],
        context: app.context
    })
    this.stream.pipe(this._eventOutput)
    this.add(this.stream)

    // Header can scroll the scrollview.
    this.header.pipe(this.stream.scrollview)

    this.jumper = new JumperView({scrollviewController: this.stream.scrollviewController})
    this
        .add(new Modifier({transform: Transform.translate(0, 0, 1)}))
        .add(this.jumper)
}

Articles.prototype.load = function() {
    if (this._loaded) return
    this.stream.centralSpinner.show()
    this.models.user.authorize.then(this.stream.load.bind(this.stream))
    this._loaded = true
}
