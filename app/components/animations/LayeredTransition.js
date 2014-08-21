'use strict'

var Transform = require('famous/core/Transform')
var inherits = require('inherits')

var BaseTransition = require('./BaseTransition')

function LayeredTransition() {
    BaseTransition.apply(this, arguments)
}

LayeredTransition.DEFAULT_OPTIONS = {
    inTransition: {
        duration: 300,
        curve: 'easeIn'
    },
    outOpacity: 1,
    outScale: 0.9,
    outTransition: {
        duration: 300,
        curve: 'easeIn'
    },
    size: null,
    inZ: 2,
    outZ: 0
}

inherits(LayeredTransition, BaseTransition)
module.exports = LayeredTransition

LayeredTransition.prototype.outOpacity = function(val) {
    return 1
}

LayeredTransition.prototype.outTransform = function(val) {
    var o = this.options
    var scale = o.outScale + (1 - o.outScale) * val
    var x = (o.size[0] - o.size[0] * scale) / 2
    var y = (o.size[1] - o.size[1] * scale) / 2

    return Transform.multiply(
        Transform.scale(scale, scale, scale),
        Transform.translate(x, y, o.outZ)
    )
}

LayeredTransition.prototype.inOpacity = function() {
    return 1
}

LayeredTransition.prototype.inTransform = function(val) {
    var o = this.options

    return Transform.translate(o.size[0] * (1 - val), 0, o.inZ)
}
