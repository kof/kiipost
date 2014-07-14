define(function(require, exports, module) {
    'use strict'

    // https://gist.github.com/markmarijnissen/fa413a1ba7f94286af6a

    var ViewSequence = require('famous/core/ViewSequence')

    // default: No animation (i.e. the item isn't given any "swipe"-velocity when moved)
    var VELOCITY = 0

    function ScrollviewController(scrollview) {
        this._scrollview = scrollview
    }

    module.exports = ScrollviewController

    ScrollviewController.prototype.getIndex = function () {
      return this._scrollview._node.getIndex()
    }

    ScrollviewController.prototype.goToIndex = function(i, velocity, position) {
        // if we're already there, don't move!
        if (i == this.getIndex()) return
        // create ViewSequence node at proper location
        var _ = this._scrollview._node._
        var node = new ViewSequence({
            _: _,
            index: i
        })
        // Animate the movement (default is no animation)
        if (velocity === undefined) velocity = VELOCITY
        // If animated (i.e. velocity > 0), start at +/- height from the item, and swipe towards proper position (0)
        if (position === undefined) position = velocity > 0 ? this._scrollview._node.getSize()[this._scrollview.options.direction]: 0
        // We're swiping from the top, start before (negative height) and swipe down (positive velocity)
        position = -1.0 * position
        // Unless we're swiping from the bottom, then we reverse position/velocity
        if (i < this.getIndex()) {
            velocity = -1.0 * velocity
            position = -1.0 * position
        }
        // Set the Scrollview
        this._scrollview.sequenceFrom(node)
        // Position a little bit away from the element
        this._scrollview.setPosition(position)
        // And swipe from there -- (and hope that scrollview ends in the right position - it's a bit of guesswork...)
        this._scrollview.setVelocity(velocity)
    }

    ScrollviewController.prototype.goToFirst = function(velocity, position) {
        this.goToIndex(this._scrollview._node._.firstIndex, velocity, position)
    }

    ScrollviewController.prototype.goToLast = function(velocity, position) {
        var _ = this._scrollview._node._
        var index = _.firstIndex + _.array.length - 1
        this.goToIndex(index, position, velocity)
    }
})
