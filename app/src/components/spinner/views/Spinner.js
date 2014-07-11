define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ImageSurface = require('famous/surfaces/ImageSurface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var Surface = require('famous/core/Surface')
    var RenderController = require('famous/views/RenderController')

    function Spinner() {
        RenderController.apply(this, arguments)

        this.container = new ContainerSurface({
            classes: ['spinner']
        })
        this.boxModifier = new Modifier({
            origin: this.options.origin,
            transform: Transform.inFront
        })
        this.box = new Surface({
            classes: ['box'],
            size: this.options.size,
            content: '<span class="icon rotate"/>'
        })
        this.container.add(this.boxModifier).add(this.box)
    }

    inherits(Spinner, RenderController)
    module.exports = Spinner

    Spinner.DEFAULT_OPTIONS = {
        // Wait before showing indicator
        // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
        delay: 1000,
        size: [true, true],
        origin: [0.5, 0.5],
        inTransition: {duration: 0},
        outTransition: {duration: 0}
    }

    Spinner.prototype.show = function(immediate) {
        if (this._showing >= 0) return
        clearTimeout(this._timeoutId)
        this._timeoutId = setTimeout(function() {
            Spinner.super_.prototype.show.call(this, this.container)
        }.bind(this), immediate ? 0 : this.options.delay)
    }

    Spinner.prototype.hide = function() {
        clearTimeout(this._timeoutId)
        Spinner.super_.prototype.hide.call(this)
    }
})
