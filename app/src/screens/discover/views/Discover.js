define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')

    var HeaderView = require('components/header/views/Header')
    var StreamView = require('components/stream/views/Stream')

    var StreamItemView = require('./StreamItem')

    function Discover() {
        View.apply(this, arguments)
        this.header = new HeaderView(this.options)
        this.stream = new StreamView({
            ItemView: StreamItemView,
            header: this.header,
            collection: this.options.collection
        })
        this.stream.addClass('discover')
        this.add(this.stream)
    }

    inherits(Discover, View)
    module.exports = Discover

    Discover.DEFAULT_OPTIONS = {
        backgroundImage: 'content/images/discover-header.jpg'
    }
})
