define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Transform = require('famous/core/Transform')
    var RenderController = require('famous/views/RenderController')
    var CachedMap = require('famous/transitions/CachedMap')

    var ScrollviewController = require('components/famous/ScrollviewController')

    function Jumper() {
        RenderController.apply(this, arguments)
        this.scrollview = this.options.scrollview

        this._scrollviewCountroller = new ScrollviewController(this.scrollview)

        this.surface = new Surface({
            content: 'arrowup',
            size: this.options.size,
            classes: ['jumper', 'icomatic']
        })

        var getOrigin = _.identity.bind(_, this.options.origin)

        this.inOriginFrom(getOrigin)
        this.outOriginFrom(getOrigin)
        this.inTransformFrom(CachedMap.create(function(scale) {
            return Transform.scale(scale, scale)
        }))
        this.outTransformFrom(CachedMap.create(function(scale) {
            return Transform.scale(scale, scale)
        }))

        this.surface.on('click', this._onJump.bind(this))
        this.scrollview.sync.on('update', this._onScroll.bind(this))
    }

    inherits(Jumper, RenderController)
    module.exports = Jumper

    Jumper.DEFAULT_OPTIONS = {
        origin: [0.5, 0.1],
        size: [45, 45],
        scrollview: null,
        // Min amount of px to scroll back before jumper will be shown.
        scrollBackDelta: 3,
        inTransition: {duration: 200},
        outTransition: {duration: 200}
    }

    Jumper.prototype._onScroll = _.throttle(function(e) {
        if (Math.abs(e.delta) < this.options.scrollBackDelta) return

        // Show
        if (e.delta > 0) {
            // XXX After scrolling down and up, pageSpringPosition value never
            // gets its original value 0
            // Only Show if not on the first page.
            if (this._scrollviewCountroller.getIndex() > 2) {
                this._show()
            } else {
                this._hide()
            }
        // Hide
        } else {
            this._hide()
        }
    }, 200, {leading: false})

    Jumper.prototype._hide = function() {
        if (this._showing > -1) this.hide()
    }

    Jumper.prototype._show = function() {
        if (this._showing < 0) this.show(this.surface)
    }

    Jumper.prototype._onJump = function() {
        this.hide(this.surface)
        this._scrollviewCountroller.goToFirst(5)
    }
})
