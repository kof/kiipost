define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ImageSurface = require('famous/surfaces/ImageSurface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    function Spinner() {
        View.apply(this, arguments)

        this.hidden = true
        this.container = new ContainerSurface({
            classes: ['spinner'],
            size: this.options.containerSize,
            properties: {display: 'none'}
        })
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.container)

        this.image = new ImageSurface({
            size: this.options.imageSize,
            content: this.options.content
        })

        var angle = 0
        this.imageModifier = new Modifier({
            origin: [0.5, 0.5],
            transform : function() {
                if (this.hidden) return
                angle += this.options.step
                return Transform.rotateZ(angle)
            }.bind(this)
        })
        this.container.add(this.imageModifier).add(this.image)

        this._eventInput.on('spinner:show', this.show.bind(this))
        this._eventInput.on('spinner:hide', this.hide.bind(this))
    }

    inherits(Spinner, View)
    module.exports = Spinner

    Spinner.DEFAULT_OPTIONS = {
        // Wait before showing indicator
        // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
        delay: 1000,
        // Step to rotate in rad.
        step: 0.07,
        containerSize: [100, 100],
        imageSize: [50, 50],
        content: '/src/components/spinner/images/grey-100.png'
    }

    Spinner.prototype.show = function(immediate) {
        clearTimeout(this._timeoutId)
        this._timeoutId = setTimeout(function() {
            this.hidden = false
            this.container.setProperties({display: 'block'})
        }.bind(this), immediate ? 0 : this.options.delay)
    }

    Spinner.prototype.hide = function() {
        clearTimeout(this._timeoutId)
        this.hidden = true
        this.container.setProperties({display: 'none'})
    }
})
