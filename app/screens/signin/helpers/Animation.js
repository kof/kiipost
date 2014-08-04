'use strict'

var chainer = require('chainer')
var _ = require('underscore')

var Transform = require('famous/core/Transform')
var Transitionable = require('famous/transitions/Transitionable')
var TransitionableTransform = require('famous/transitions/TransitionableTransform')

var animationOptions = require('./animationOptions')

function Animation(container, options) {
    this.options = _.extend({}, Animation.DEFAULT_OPTIONS, options)
    this._container = container
    this.initialize()
}

module.exports = Animation

Animation.DEFAULT_OPTIONS = _.defaults({
    context: null
}, animationOptions)

Animation.prototype.initialize = function() {
    var o = this.options
    var container = this._container

    this._logoTransitionable = new TransitionableTransform()
    this._logoTransitionable.set(Transform.translate(
        o.context.getSize()[0] * o.start.logo.left - container.logo.surface.getSize()[0] / 2,
        o.context.getSize()[1] * o.start.logo.top - container.logo.surface.getSize()[1] / 2
    ))
    container.logo.modifier.transformFrom(this._logoTransitionable)

    this._sloganTransitionable = new Transitionable(o.start.slogan.opacity)
    container.slogan.modifier
        .originFrom(o.start.slogan.origin)
        .opacityFrom(this._sloganTransitionable)

    this._connectTransitionableOpacity = new Transitionable(o.start.connect.opacity)
    this._connectTransitionableTransform = new TransitionableTransform()
    container.connect.modifier
        .originFrom(o.start.connect.origin)
        .transformFrom(this._connectTransitionableTransform)
        .opacityFrom(this._connectTransitionableOpacity)

    this._bgTransitionable = new Transitionable(o.start.bg.opacity)
    container.bg.modifier.opacityFrom(this._bgTransitionable)
}

Animation.prototype.in = function(callback) {
    var o = this.options.in
    var context = this.options.context
    var chain = chainer()
    var container = this._container

    chain.add(function() {
        this._logoTransitionable.set(
            Transform.translate(
                context.getSize()[0] * o.logo.left - container.logo.surface.getSize()[0] / 2,
                context.getSize()[1] * o.logo.top - container.logo.surface.getSize()[1] / 2
            ),
            o.logo.transition,
            chain.next.bind(chain)
        )
    }.bind(this))

    chain.add(function() {
        var next = _.after(2, chain.next.bind(chain))
        this._sloganTransitionable.set(o.slogan.opacity, o.slogan.transition, next)
        this._bgTransitionable.set(o.bg.opacity, o.bg.transition, next)
    }.bind(this))

    chain.add(function() {
        var next = _.after(2, chain.next.bind(chain))

        this._connectTransitionableOpacity.set(
            o.connect.opacity,
            o.connect.transition,
            next
        )

        this._connectTransitionableTransform.set(
            Transform.translate(0, -o.connect.top),
            o.connect.transition,
            next
        )

    }.bind(this))

    chain.add(callback)

    chain.start()
}

Animation.prototype.out = function(callback) {
    var o = this.options.out
    var chain = chainer()

    chain.add(function() {
        var next = _.after(2, chain.next.bind(chain))

        this._connectTransitionableOpacity.set(
            o.connect.opacity,
            o.connect.transition,
            next
        )
        this._sloganTransitionable.set(
            o.slogan.opacity,
            o.slogan.transition,
            next
        )
    }.bind(this))

    chain.add(function() {
        this._logoTransitionable.set(
            Transform.multiply(
                Transform.scale(o.logo.scale, o.logo.scale),
                Transform.translate(o.logo.left, o.logo.top)
            ),
            o.logo.transition,
            chain.next.bind(chain)
        )
    }.bind(this))

    chain.add(callback)

    chain.start()
}
