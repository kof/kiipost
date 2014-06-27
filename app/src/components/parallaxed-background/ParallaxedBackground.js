define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    function ParallaxedBackground() {
        View.apply(this, arguments)

        var o = this.options
        var size = o.context.getSize()

        this.x = -o.offset
        this.y = -o.offset

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

        this._onChange = _.throttle(this._transform.bind(this), 50)
        this.container.on('deploy', this._onDeploy.bind(this))
        this.container.on('recall', this._onRecall.bind(this))
    }

    inherits(ParallaxedBackground, View)
    module.exports = ParallaxedBackground

    ParallaxedBackground.DEFAULT_OPTIONS = {
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

    ParallaxedBackground.prototype.setContent = function(url) {
        this.image.setProperties({backgroundImage: 'url(' + url + ')'})
    }

    ParallaxedBackground.prototype.setProperties = function(props) {
        return this.image.setProperties(props)
    }

    ParallaxedBackground.prototype._onDeploy = function() {
        window.addEventListener('deviceorientation', this._onChange)
    }

    ParallaxedBackground.prototype._onRecall = function() {
        window.removeEventListener('deviceorientation', this._onChange)
    }

    ParallaxedBackground.prototype._transform = function(e) {
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
