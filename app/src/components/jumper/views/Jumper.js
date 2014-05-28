define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Transform = require('famous/core/Transform')
    var StateModifier = require('famous/modifiers/StateModifier')

    var app = require('app')

    function Jumper() {
        View.apply(this, arguments)
        this.scrollview = this.options.scrollview
        this.hidden = true

        this.surface = new Surface({
            content: 'arrowup',
            size: this.options.size,
            classes: ['jumper', 'icomatic']
        })
        this.modifier = new StateModifier({origin: [0.5, 0.05]})
        this.modifier.setTransform(Transform.scale(0, 0))
        this.add(this.modifier).add(this.surface)

        this.surface.on('click', this._onClick.bind(this))
        this.scrollview.sync.on('update', this._onScroll.bind(this))
    }

    inherits(Jumper, View)
    module.exports = Jumper

    Jumper.DEFAULT_OPTIONS = {
        size: [45, 45],
        scrollview: null,
        // Min amount of px to scroll back before jumper will be shown.
        scrollBackDelta: 3,
        duration: 200
    }

    Jumper.prototype.hide = _.debounce(function() {
        this.modifier.setTransform(Transform.scale(0, 0), {duration: this.options.duration})
        this.hidden = true
    }, 500, true)

    Jumper.prototype.show = _.debounce(function() {
        this.modifier.setTransform(Transform.scale(1, 1), {duration: this.options.duration})
        this.hidden = false
    }, 500, true)

    Jumper.prototype._onScroll = function(e) {
        if (e.delta >= this.options.scrollBackDelta) {
            // XXX After scrolling down and up, pageSpringPosition value never
            // gets its original value 0
            if (this.scrollview._pageSpringPosition < -3) {
                this.show()
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
