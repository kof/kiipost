'use strict'

var inherits = require('inherits')

var View = require('famous/core/View')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')

var EventProxy = require('app/components/famous/EventProxy')
var HeaderView = require('app/components/app-header/views/AppHeader')
var StreamView = require('app/components/stream/views/Stream')
var NaviView = require('app/components/navi/views/Navi')
var JumperView = require('app/components/jumper/views/Jumper')
var ParallaxedBackgroundView = require('app/components/parallaxed-background/ParallaxedBackground')

var MemoView = require('./Memo')
var app = require('app')

function Memos() {
    View.apply(this, arguments)

    this.models = this.options.models

    this.background = new ParallaxedBackgroundView({context: app.context})
    this.add(this.background)

    this.header = new HeaderView({
        context: app.context,
        models: this.models
    })

    this.navi = new NaviView({selected: 'memos'})
    this.navi.pipe(new EventProxy(function(name, data, emit) {
        emit('navi:' + name, data)
    })).pipe(this._eventOutput)
    this.header.surface.add(this.navi)

    this.stream = new StreamView({
        ItemView: MemoView,
        views: [this.header],
        collection: this.options.collection,
        models: this.models,
        classes: ['memos'],
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

inherits(Memos, View)
module.exports = Memos

Memos.DEFAULT_OPTIONS = {}

Memos.prototype.load = function(options, callback) {
    if (this.loaded) {
        if (callback) callback()
        return
    }
    this.stream.centralSpinner.show()
    this.models.user.authorize.then(function() {
        this.stream.load(options, callback)
    }.bind(this))
    this.loaded = true
}
