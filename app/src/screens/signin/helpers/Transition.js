define(function(require, exports, module) {
    'use strict'

    var chainer = require('chainer')
    var _ = require('underscore')

    var Transform = require('famous/core/Transform')
    var easing = require('famous/transitions/Easing')

    var noop = function() {}

    function Transition(container, options) {
        this._container = container
        this.options = _.extend({}, Transition.DEFAULT_OPTIONS, options)
    }

    module.exports = Transition

    Transition.DEFAULT_OPTIONS = {
        logo: {
            origin: [0.5, 0.2],
            transition: {
                duration: 500,
                curve: easing.inOutQuad
            }
        },
        slogan: {
            opacity: 1,
            transition: {duration: 500}
        },
        connect: {
            opacity: 1,
            origin: [0.5, 0.8],
            transition: {duration: 200}
        },
        bg: {
            opacity: 1,
            transition: {duration: 500}
        }
    }

    Transition.prototype.in = function(callback) {
        var o = this.options
        var chain = chainer()
        var container = this._container

        chain.add(function() {
            container.logoModifier.setOrigin(
                o.logo.origin,
                o.logo.transition,
                chain.next.bind(chain)
            )
        })

        chain.add(function() {
            var next = _.after(2, chain.next.bind(this))
            container.sloganModifier.setOpacity(
                o.slogan.opacity,
                o.slogan.transition,
                next
            )
            container.bgModifier.setOpacity(
                o.bg.opacity,
                o.bg.transition,
                next
            )
        })

        chain.add(function() {
            var next = _.after(2, chain.next.bind(chain))

            container.connectModifier.setOpacity(
                o.connect.opacity,
                o.connect.transition,
                next
            )
            container.connectModifier.setOrigin(
                o.connect.origin,
                o.connect.transition,
                next
            )
        })

        chain.add(callback)

        chain.start()
    }
})
