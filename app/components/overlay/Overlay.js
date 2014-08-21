'use strict'

var inherits = require('inherits')

var RenderController = require('famous/views/RenderController')
var Surface = require('famous/core/Surface')
var Transform = require('famous/core/Transform')

/**
 * Dark overlay to put on top of any screen.
 */
function Overlay() {
    RenderController.apply(this, arguments)
    var o = this.options

    this.container = new Surface({
        classes: ['overlay'],
        properties: {
            background: o.background
        }
    })

    this.inTransformMap = function() {
        return o.inTransform
    }

    this.outTransformMap = function() {
        return o.outTransform
    }

    this.inOpacityMap = function(val) {
        return val < o.opacity ? val : o.opacity
    }

    this.outOpacityMap = function(val) {
        return val > o.opacity ? o.opacity : val
    }
}

inherits(Overlay, RenderController)
module.exports = Overlay

Overlay.DEFAULT_OPTIONS = {
    inTransform: Transform.translate(0, 0, 1),
    outTransform: Transform.translate(0, 0, 1),
    opacity: 0.5,
    background: '#000',
    inTransition: {duration: 300},
    outTransition: {duration: 300}
}

Overlay.prototype.show = function() {
    RenderController.prototype.show.call(this, this.container, this.options.inTransition)
}

Overlay.prototype.hide = function() {
    RenderController.prototype.hide.call(this, this.options.outTransition)
}
