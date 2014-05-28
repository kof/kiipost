define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')

    function Jumper() {
        View.apply(this, arguments)
        this.scrollview = this.options.scrollview
        this.hidden = true
        this.surface = new Surface({
            size: [undefined, 30],
            classes: ['jumper']
        })
        this.add(this.surface)
        this.surface.on('click', this._onClick.bind(this))
        this.scrollview.sync.on('update', this._onScroll.bind(this))
    }

    inherits(Jumper, View)
    module.exports = Jumper

    Jumper.DEFAULT_OPTIONS = {
        scrollview: null,
        // Min amount of px to scroll back before jumper will be shown.
        scrollBackDelta: 3
    }

    Jumper.prototype.hide = function() {
        this.surface.setProperties({display: 'none'})
        this.hidden = true
    }

    Jumper.prototype._onScroll = function(e) {
        if (e.delta >= this.options.scrollBackDelta) {
            // XXX After scrolling down and up, pageSpringPosition value never
            // gets its original value 0
            if (this.scrollview._pageSpringPosition < -3) {
                this.surface.setProperties({display: 'block'})
                this.hidden = false
            } else {
                this.hide()
            }
        } else if (!this.hidden && e.delta < 0) {
            this.hide()
        }
    }

    Jumper.prototype._onClick = function() {
        this.hide()
        this.scrollview.setPosition(-1000000)
    }
})
