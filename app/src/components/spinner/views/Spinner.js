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

        this.rotate = false
        this.container = new ContainerSurface({
            classes: ['spinner'],
            size: this.options.containerSize
        })
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.container)

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
    }

    inherits(Spinner, View)
    module.exports = Spinner

    Spinner.DEFAULT_OPTIONS = {
        // Step to rotate in rad.
        step: 0.07,
        containerSize: [100, 100],
        imageSize: [50, 50],
        content: '/src/components/spinner/images/grey-100.png'
    }

    Spinner.prototype.start = function() {
        this.rotate = true
    }

    Spinner.prototype.stop = function() {
        this.rotate = false
    }
})
