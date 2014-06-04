define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')

    var app = require('app')

    function Background() {
        View.apply(this, arguments)

        var o = this.options
        var size = o.size || app.context.getSize()

        this.image = new Surface({
            classes: ['background'],
            properties: o.properties,
            size: [size[0] + o.offset * 2, size[1] + o.offset * 2]
        })
        this.modifier = new Modifier({origin: [0.5, 0.5]})
        this.add(this.modifier).add(this.image)
        if (o.content) this.setContent(o.content)
        this._initParallax()
    }

    inherits(Background, View)
    module.exports = Background

    Background.DEFAULT_OPTIONS = {
        offset: 20,
        content: '/content/images/background.png',
        size: null,
        properties: {
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: null,
            zIndex: -1
        }
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

        app.context.on('deviceorientation', function(e) {
            var x = e.gamma
            var y = e.beta
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
        }.bind(this));
    }
})
