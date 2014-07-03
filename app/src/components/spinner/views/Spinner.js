define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ImageSurface = require('famous/surfaces/ImageSurface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var RenderController = require('famous/views/RenderController')

    function Spinner() {
        RenderController.apply(this, arguments)

        this.container = new ContainerSurface({
            classes: ['spinner'],
            size: this.options.size
        })

        this.image = new ImageSurface({
            size: this.options.size,
            content: this.options.content
        })

        var angle = 0
        var rotationModifier
        rotationModifier = new Modifier({
            origin: this.options.origin,
            transform: function(val) {
                angle += this.options.step
                return Transform.rotateZ(angle)
            }.bind(this)
        })
        this.spinner = this.add(new Modifier({
            origin: this.options.origin,
            transform: Transform.inFront
        }))
        this.spinner.add(this.container)
        this.container.add(rotationModifier).add(this.image)
    }

    inherits(Spinner, RenderController)
    module.exports = Spinner

    Spinner.DEFAULT_OPTIONS = {
        // Wait before showing indicator
        // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
        delay: 1000,
        inTransition: false,
        outTransition: false,
        // Step to rotate in rad.
        step: 0.07,
        size: [true, true],
        origin: [0.5, 0.5],
        content: 'src/components/spinner/images/grey-100.png'
    }

    Spinner.prototype.show = function(immediate) {
        if (this._showing >= 0) return
        clearTimeout(this._timeoutId)
        this._timeoutId = setTimeout(function() {
            Spinner.super_.prototype.show.call(this, this.spinner)
        }.bind(this), immediate ? 0 : this.options.delay)
    }

    Spinner.prototype.hide = function() {
        clearTimeout(this._timeoutId)
        Spinner.super_.prototype.hide.call(this)
    }
})
