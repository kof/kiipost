define(function(require, exports, module) {
    'use strict'

    var chainer = require('chainer')
    var _ = require('underscore')

    var Transform = require('famous/core/Transform')
    var easing = require('famous/transitions/Easing')

    function Transition(container, options) {
        this._container = container
        this.options = _.extend({}, Transition.DEFAULT_OPTIONS, options)
    }

    module.exports = Transition

    Transition.DEFAULT_OPTIONS = {
        context: null,
        in: {
            logo: {
                left: 0.5,
                top: 0.32,
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
        },
        out: {
            connect: {
                opacity: 0,
                transition: {duration: 200}
            },
            slogan: {
                opacity: 0,
                transition: {duration: 200}
            },
            logo: {
                top: 70,
                left: 70,
                scale: 0.3,
                transition: {
                    duration: 500,
                    curve: easing.inOutQuad
                }
            }
        }
    }

    Transition.prototype.in = function(callback) {
        var o = this.options.in
        var context = this.options.context
        var chain = chainer()
        var container = this._container

        chain.add(function() {
            container.logoModifier.setTransform(
                Transform.translate(
                    context.getSize()[0] * o.logo.left - container.logo.getSize()[0] / 2,
                    context.getSize()[1] * o.logo.top - container.logo.getSize()[1] / 2
                ),
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

    Transition.prototype.out = function(callback) {
        var o = this.options.out
        var chain = chainer()
        var container = this._container

        chain.add(function() {
            var next = _.after(2, chain.next.bind(chain))

            container.connectModifier.setOpacity(
                o.connect.opacity,
                o.connect.transition,
                next
            )

            container.sloganModifier.setOpacity(
                o.slogan.opacity,
                o.slogan.transition,
                next
            )
        })

        chain.add(function() {
            container.logoModifier.setTransform(
                Transform.multiply(
                    Transform.scale(o.logo.scale, o.logo.scale),
                    Transform.translate(o.logo.left, o.logo.top)
                ),
                o.logo.transition,
                chain.next.bind(chain)
            )
        })

        chain.add(callback)

        chain.start()
    }
})
