define(function(require, exports, module) {
    'use strict'

    var CachedMap = require('famous/transitions/CachedMap')
    var Transform = require('famous/core/Transform')
    var _ = require('underscore')

    function LayeredTransition(options) {
        var o = this.options = _.extend({}, LayeredTransition.DEFAULT_OPTIONS, options)
        var spec = this.spec = {}

        spec.outOpacityFrom = CachedMap.create(function(val) {
            return o.outOpacity + (1 - o.outOpacity) * val
        })
        spec.outTransformFrom = CachedMap.create(function(val) {
            var scale = o.outScale + (1 - o.outScale) * val

            var x = (o.size[0] - o.size[0] * scale) / 2
            var y = (o.size[1] - o.size[1] * scale) / 2
            return Transform.multiply(
                Transform.scale(scale, scale, scale),
                Transform.translate(x, y, 0)
            )
        })
        spec.outTransition = o.outTransition

        spec.inOpacityFrom = function() {
            return 1
        }
        spec.inTransformFrom = CachedMap.create(function(val) {
            return Transform.multiply(
                Transform.translate(o.size[0] * (1 - val), 0, 0),
                Transform.inFront
            )
        })
        spec.inTransition = o.inTransition
    }

    LayeredTransition.DEFAULT_OPTIONS = {
        inTransition: {
            duration: 300,
            curve: 'easeIn'
        },
        outOpacity: 0.5,
        outScale: 0.9,
        outTransition: {
            duration: 300,
            curve: 'easeIn'
        },
        size: null
    }

    module.exports = LayeredTransition

    LayeredTransition.prototype.commit = function(controller, reverse) {
        for (var method in this.spec) {
            var spec = method

            if (reverse) {
                if (method[0] == 'i') {
                    spec = method.replace(/^in/, 'out')
                } else {
                    spec = method.replace(/^out/, 'in')
                }
            }

            if (method == 'inTransition' || method == 'outTransition') {
                controller.options[method] = this.spec[spec]
            } else {
                controller[method](this.spec[spec])
            }
        }
    }
})
