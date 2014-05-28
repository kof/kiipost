define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')

    var HeaderView = require('components/header/views/Header')
    var StreamView = require('components/stream/views/Stream')
    var MenuView = require('components/menu/views/Menu')
    var JumperView = require('components/jumper/views/Jumper')

    var StreamItemView = require('./StreamItem')

    function Discover() {
        View.apply(this, arguments)
        this.header = new HeaderView(this.options)
        this.menu = new MenuView()
        this.header.surface.add(this.menu)

        this.stream = new StreamView({
            ItemView: StreamItemView,
            views: [this.header],
            collection: this.options.collection
        })
        this.stream.addClass('discover')
        // Header can scroll the scrollview.
        this.header._eventInput.pipe(this.stream.scrollview)
        // Let header react on "update"
        //this.scrollview._eventInput.pipe(header._eventOutput)
        this.add(this.stream)

        this.jumper = new JumperView({scrollview: this.stream.scrollview})
        this.add(this.jumper)
    }

    inherits(Discover, View)
    module.exports = Discover

    Discover.DEFAULT_OPTIONS = {}
})
