define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')

    var HeaderView = require('components/header/views/Header')
    var StreamView = require('components/stream/views/Stream')
    var MenuView = require('components/menu/views/Menu')
    var JumperView = require('components/jumper/views/Jumper')
    var SpinnerView = require('components/spinner/views/Spinner')
    var BackgroundView = require('components/background/Background')

    var DiscoverItemView = require('./DiscoverItem')

    function Discover() {
        View.apply(this, arguments)

        this.background = new BackgroundView()
        this.add(this.background)

        this.header = new HeaderView(this.options)

        this.menu = new MenuView()
        this.menu.pipe(this._eventOutput)
        this.header.surface.add(this.menu)

        this.spinner = new SpinnerView()
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.spinner)

        this.stream = new StreamView({
            ItemView: DiscoverItemView,
            views: [this.header],
            collection: this.options.collection
        })
        this.stream.addClass('discover')
        this.stream.pipe(this._eventOutput)
        this.stream.on('stream:loadstart', this.spinner.show.bind(this.spinner))
        this.stream.on('stream:loadend', this.spinner.hide.bind(this.spinner))
        this.add(this.stream)

        // Header can scroll the scrollview.
        this.header._eventInput.pipe(this.stream.scrollview)

        this.jumper = new JumperView({scrollview: this.stream.scrollview})
        this.add(new Modifier({origin: [0.5, 0.05]})).add(this.jumper)
    }

    inherits(Discover, View)
    module.exports = Discover

    Discover.DEFAULT_OPTIONS = {}


    Discover.prototype.load = function() {
        this.stream.load()
    }

})
