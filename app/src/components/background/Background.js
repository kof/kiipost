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
        var size = app.context.getSize()

        this.image = new Surface({
            classes: ['background'],
            properties: {
                backgroundSize: 'cover',
                backgroundImage: 'url(' + o.url + ')',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            },
            size: [size[0] + o.offset * 2, size[1] + o.offset * 2]
        })
        this.modifier = new Modifier({origin: [0.5, 0.5]})
        this.add(this.modifier).add(this.image)

        this.x = -o.offset
        this.y = -o.offset
        window.addEventListener('deviceorientation', function(e) {
            var x = e.gamma
            var y = e.beta

            if (x < o.offset && x > -o.offset) this.x = -x
            if (y < o.offset && y > -o.offset) this.y = -y
            this.modifier.transformFrom(Transform.translate(this.x, this.y, 0))
        }.bind(this));
    }

    inherits(Background, View)
    module.exports = Background

    Background.DEFAULT_OPTIONS = {
        offset: 40,
        url: '/content/images/background.png'
    }
})
