define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Transform = require('famous/core/Transform')
    var StateModifier = require('famous/modifiers/StateModifier')
    var RenderController = require('famous/views/RenderController')

    var app = require('app')

    function Jumper() {
        RenderController.apply(this, arguments)
        this.scrollview = this.options.scrollview

        this._height = app.context.getSize()[1]

        this.surface = new Surface({
            content: 'arrowup',
            size: this.options.size,
            classes: ['jumper', 'icomatic']
        })

        this.inTransformFrom(function(scale) {
            if (scale < 1) return Transform.scale(scale, scale)
        })

        this.outTransformFrom(function(scale) {
            if (scale > 0) return Transform.scale(scale, scale)
        })

        this.surface.on('click', this._onClick.bind(this))
        this.scrollview.sync.on('update', this._onScroll.bind(this))
    }

    inherits(Jumper, RenderController)
    module.exports = Jumper

    Jumper.DEFAULT_OPTIONS = {
        size: [45, 45],
        scrollview: null,
        // Min amount of px to scroll back before jumper will be shown.
        scrollBackDelta: 3,
        inTransition: {duration: 200},
        outTransition: {duration: 200},
    }

    Jumper.prototype._onScroll = function(e) {
        if (Math.abs(e.delta) < this.options.scrollBackDelta) return

        // Show
        if (e.delta > 0) {
            // XXX After scrolling down and up, pageSpringPosition value never
            // gets its original value 0
            // Only Show if not on the first page.
            if (this.scrollview._pageSpringPosition < -this._height) {
                this._show()
            } else {
                this._hide()
            }
        // Hide
        } else {
            this._hide()
        }
    }

    Jumper.prototype._hide = function() {
        if (this._showing > -1) this.hide(this.surface)
    }

    Jumper.prototype._show = function() {
        if (this._showing < 0) this.show(this.surface)
    }

    Jumper.prototype._onClick = function() {
        this.hide(this.surface)
        this.scrollview.setPosition(-1000000)
    }
})
