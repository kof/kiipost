
define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')

    var EventProxy = require('components/famous/EventProxy')
    var HeaderView = require('components/header/views/Header')
    var StreamView = require('components/stream/views/Stream')
    var MenuView = require('components/menu/views/Menu')
    var JumperView = require('components/jumper/views/Jumper')
    var SpinnerView = require('components/spinner/views/Spinner')
    var ParallaxedBackgroundView = require('components/parallaxed-background/ParallaxedBackground')

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

        this.menu = new MenuView({selected: 'memos'})
        this.menu.pipe(new EventProxy(function(name, data, emit) {
            emit('menu:' + name, data)
        })).pipe(this._eventOutput)
        this.header.surface.add(this.menu)

        this.spinner = new SpinnerView()
        this.add(this.spinner)

        this.stream = new StreamView({
            ItemView: MemoView,
            views: [this.header],
            collection: this.options.collection,
            models: this.models,
            classes: ['memos'],
            backTop: this.header.getSize()[1]
        })
        this.stream
            .on('loadStart', this.spinner.show.bind(this.spinner))
            .on('loadEnd', this.spinner.hide.bind(this.spinner))
            .pipe(this._eventOutput)
        this.add(this.stream)

        // Header can scroll the scrollview.
        this.header.pipe(this.stream.scrollview)

        this.jumper = new JumperView({
            scrollview: this.stream.scrollview,
            context: app.context
        })
        this.add(this.jumper)
    }

    inherits(Memos, View)
    module.exports = Memos

    Memos.DEFAULT_OPTIONS = {}

    Memos.prototype.load = function(options) {
        if (this.loaded) return
        this.spinner.show()
        this.models.user.authorize.then(function() {
            this.stream.load(options)
        }.bind(this))
        this.loaded = true
    }
})
