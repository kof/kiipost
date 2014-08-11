'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var Surface = require('famous/core/Surface')
var Transform = require('famous/core/Transform')
var RenderController = require('famous/views/RenderController')
var CachedMap = require('famous/transitions/CachedMap')

function Jumper() {
    RenderController.apply(this, arguments)
    this._scrollviewController = this.options.scrollviewController

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
    this._scrollviewController.scrollview.sync.on('update', this._onUpdate.bind(this))
    this._scrollviewController.on('scrollEnd', this._onScrollEnd.bind(this))
}

inherits(Jumper, RenderController)
module.exports = Jumper

Jumper.DEFAULT_OPTIONS = {
    origin: [0.5, 0.05],
    size: [45, 45],
    scrollviewController: null,
    // Min amount of px to scroll back before jumper will be shown.
    scrollBackDelta: 3,
    // Min amount of pages have to be scrolled down.
    minPages: 2,
    inTransition: {duration: 200},
    outTransition: {duration: 200}
}

Jumper.prototype._hide = function() {
    if (this._showing > -1) this.hide()
}

Jumper.prototype._show = function() {
    if (this._showing < 0) this.show(this.surface)
}

Jumper.prototype._onUpdate = _.throttle(function(e) {
    if (Math.abs(e.delta) < this.options.scrollBackDelta) return

    // Show
    if (e.delta > 0) {
        // XXX After scrolling down and up, pageSpringPosition value never
        // gets its original value 0
        // Only Show if not on the first page.
        if (this._scrollviewController.getIndex() > this.options.minPages) {
            this._show()
        } else {
            this._hide()
        }
    } else {
        this._hide()
    }
}, 200, {trailing: false})

Jumper.prototype._onScrollEnd = function() {
    if (this._scrollviewController.getIndex() < this.options.minPages) {
        this._hide()
    }
}

Jumper.prototype._onJump = function() {
    this.hide(this.surface)
    this._scrollviewController.goToFirst(5)
}
