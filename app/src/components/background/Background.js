define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    function Background() {
        View.apply(this, arguments)

        var o = this.options
        var size = o.context.getSize()

        this.container = new ContainerSurface({
            classes: ['background'],
            properties: {
                zIndex: o.properties.zIndex,
                overflow: 'hidden'
            }
        })
        this.add(this.container)
        this.image = new Surface({
            properties: o.properties,
            size: [size[0] + o.offset * 2, size[1] + o.offset * 2]
        })
        this.modifier = new Modifier({origin: [0.5, 0.5]})
        this.container.add(this.modifier).add(this.image)
        if (o.content) this.setContent(o.content)
        this._initParallax()
    }

    inherits(Background, View)
    module.exports = Background

    Background.DEFAULT_OPTIONS = {
        offset: 20,
        content: 'content/images/background.png',
        properties: {
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: null,
            zIndex: -1
        },
        context: null
    }

    Background.prototype.setContent = function(url) {
        this.image.setProperties({backgroundImage: 'url(' + url + ')'})
    }

    Background.prototype.setProperties = function(props) {
        return this.image.setProperties(props)
    }

    Background.prototype._initParallax = function() {
        var o = this.options

        this.x = -o.offset
        this.y = -o.offset
        o.context.on('deviceorientation', _.throttle(this._onDeviceOrientation.bind(this), 50))
    }

    Background.prototype._onDeviceOrientation = function(e) {
        var o = this.options
        var x = e.gamma, y = e.beta
        var set = false

        if (x < o.offset && x > -o.offset && this.x !== -x) {
            this.x = -x
            set = true
        }
        if (y < o.offset && y > -o.offset && this.y !== -y) {
            this.y = -y
            set = true
        }

        if (set) this.modifier.transformFrom(Transform.translate(this.x, this.y, 0))
    }
})
