'use strict'

var Transform = require('famous/core/Transform')
var easing = require('famous/transitions/Easing')
var inherits = require('inherits')

var BaseTransition = require('./BaseTransition')

/**
 * Currently just slide up.
 */
function SlideTransition() {
    BaseTransition.apply(this, arguments)
}

SlideTransition.DEFAULT_OPTIONS = {
    inTransition: {
        duration: 300,
        curve: easing.outQuart
    },
    outTransition: {
        duration: 300,
        curve: easing.outQuart
    },
    size: null
}

inherits(SlideTransition, BaseTransition)
module.exports = SlideTransition

SlideTransition.prototype.inOpacity =
SlideTransition.prototype.outOpacity = function() {
    return 1
}

SlideTransition.prototype.inTransform = function(val) {
    var height = this.options.size[1]

    return Transform.translate(0, height - (height * val), 0)
}

SlideTransition.prototype.outTransform = function(val) {
    var height = this.options.size[1]

    return Transform.translate(0, (height * val) - height, 0)
}
