define(function(require, exports, module) {
    'use strict'

    var CachedMap = require('famous/transitions/CachedMap')
    var Transform = require('famous/core/Transform')
    var _ = require('underscore')

    function BaseTransition(options) {
        var o = this.options = _.extend({}, this.constructor.DEFAULT_OPTIONS, options)
        var spec = this.spec = {}

        spec.outOpacityFrom = CachedMap.create(this.outOpacity.bind(this))
        spec.outTransformFrom = CachedMap.create(this.outTransform.bind(this))
        spec.outTransition = o.outTransition

        spec.inOpacityFrom = CachedMap.create(this.inOpacity.bind(this))
        spec.inTransformFrom = CachedMap.create(this.inTransform.bind(this))
        spec.inTransition = o.inTransition
    }

    BaseTransition.DEFAULT_OPTIONS = {
        inTransition:  {duration: 200},
        outTransition: {duration: 200}
    }

    module.exports = BaseTransition

    BaseTransition.prototype.commit = function(controller, reverse) {
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

    BaseTransition.prototype.outOpacity = function(val) {
        return val
    }

    BaseTransition.prototype.outTransform = function() {
        return Transform.identity
    }

    BaseTransition.prototype.inOpacity = function(val) {
        return val
    }

    BaseTransition.prototype.inTransform = function() {
        return Transform.identity
    }
})
