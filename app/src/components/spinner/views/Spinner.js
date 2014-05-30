define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ImageSurface = require('famous/surfaces/ImageSurface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var RenderController = require('famous/views/RenderController')

    function Controller() {
        RenderController.apply(this, arguments)

        this.rotate = false
        this.container = new ContainerSurface({
            classes: ['spinner'],
            size: this.options.containerSize
        })

        this.image = new ImageSurface({
            size: this.options.imageSize,
            content: this.options.content
        })

        var angle = 0
        this._imageModifier = new Modifier({
            origin: [0.5, 0.5],
            transform : function() {
                if (!this.rotate) return
                angle += this.options.step
                return Transform.rotateZ(angle)
            }.bind(this)
        })
        this.container.add(this._imageModifier).add(this.image)

        this._eventInput.on('spinner:show', this.show.bind(this))
        this._eventInput.on('spinner:hide', this.hide.bind(this))
    }

    inherits(Controller, RenderController)
    module.exports = Controller

    Controller.DEFAULT_OPTIONS = {
        // Wait before showing indicator
        // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
        delay: 1000,
        inTransition: false,
        outTransition: false,
        // Step to rotate in rad.
        step: 0.07,
        containerSize: [100, 100],
        imageSize: [50, 50],
        content: '/src/components/spinner/images/grey-100.png'
    }

    Controller.prototype.show = function(immediate) {
        clearTimeout(this._timeoutId)
        this._timeoutId = setTimeout(function() {
            this.rotate = true
            Controller.super_.prototype.show.call(this, this.container)
        }.bind(this), immediate ? 0 : this.options.delay)
    }

    Controller.prototype.hide = function() {
        clearTimeout(this._timeoutId)
        this.rotate = false
        Controller.super_.prototype.hide.call(this, this.container)
    }
})
