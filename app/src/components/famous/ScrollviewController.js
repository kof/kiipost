define(function(require, exports, module) {
    'use strict'

    // https://gist.github.com/markmarijnissen/fa413a1ba7f94286af6a

    var ViewSequence = require('famous/core/ViewSequence')
    var EventHandler = require('famous/core/EventHandler')

    // default: No animation (i.e. the item isn't given any "swipe"-velocity when moved)
    var VELOCITY = 0

    var round = Math.round

    function ScrollviewController(scrollview) {
        this.scrollview = scrollview
        this.scrolling = false
        this._lastParticlePos = 0
        this._lastParticlePosRounded = 0
        this._eventOutput = new EventHandler()
        EventHandler.setOutputHandler(this, this._eventOutput)
        this.scrollview._particle.on('update', this._onScrollParticleUpdate.bind(this))
        this.scrollview.sync.on('start', this._onScrollStart.bind(this))
        this._scrollEnd = this._scrollEnd.bind(this)
    }

    module.exports = ScrollviewController

    ScrollviewController.prototype.getIndex = function() {
      return this.scrollview._node.getIndex()
    }

    ScrollviewController.prototype.goToIndex = function(i, velocity, position) {
        // if we're already there, don't move!
        if (i == this.getIndex()) return
        // create ViewSequence node at proper location
        var _ = this.scrollview._node._
        var node = new ViewSequence({
            _: _,
            index: i
        })
        // Animate the movement (default is no animation)
        if (velocity === undefined) velocity = VELOCITY
        // If animated (i.e. velocity > 0), start at +/- height from the item, and swipe towards proper position (0)
        if (position === undefined) position = velocity > 0 ? this.scrollview._node.getSize()[this.scrollview.options.direction]: 0
        // We're swiping from the top, start before (negative height) and swipe down (positive velocity)
        position = -1.0 * position
        // Unless we're swiping from the bottom, then we reverse position/velocity
        if (i < this.getIndex()) {
            velocity = -1.0 * velocity
            position = -1.0 * position
        }
        // Set the Scrollview
        this.scrollview.sequenceFrom(node)
        // Position a little bit away from the element
        this.scrollview.setPosition(position)
        // And swipe from there -- (and hope that scrollview ends in the right position - it's a bit of guesswork...)
        this.scrollview.setVelocity(velocity)
    }

    ScrollviewController.prototype.goToFirst = function(velocity, position) {
        this.goToIndex(this.scrollview._node._.firstIndex, velocity, position)
    }

    ScrollviewController.prototype.goToLast = function(velocity, position) {
        var _ = this.scrollview._node._
        var index = _.firstIndex + _.array.length - 1
        this.goToIndex(index, position, velocity)
    }

    ScrollviewController.prototype._scrollEnd = function() {
        if (!this.scrolling) return
        this.scrolling = false
        this._eventOutput.emit('scrollEnd')
    }

    /**
     * Attention, this is called on each tick.
     */
    ScrollviewController.prototype._onScrollParticleUpdate = function(particle) {
        var pos = particle.position.x
        if (pos === this._lastParticlePos) return
        // We round the position, because particle changes its position for a long time
        // while chaning its position by a < 1px number, scrolling is optically done.
        var rounded = round(pos)
        if (rounded === this._lastParticlePosRounded) return
        this.scrolling = true
        this._eventOutput.emit('scroll')
        if (this._timeout) clearTimeout(this._timeout)
        this._timeout = setTimeout(this._scrollEnd, 100)
        this._lastParticlePos = pos
        this._lastParticlePosRounded = rounded
    }

    ScrollviewController.prototype._onScrollStart = function() {
        this._eventOutput.emit('scrollStart')
    }
})
