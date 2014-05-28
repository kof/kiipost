define(function(require, exports, module) {
    'use strict'

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    var inherits = require('inherits')

    var app = require('app')

    function Header() {
        View.apply(this, arguments)

        this.options.size = [undefined, this.options.height * app.context.getSize()[1]]

        this.surface = new ContainerSurface({
            size: this.options.size,
            classes: ['header']
        })
        this.surface.pipe(this)
        this.surface.on('click', this._onClick.bind(this))

        this.logo = new Surface({
            content: 'kiipost',
            classes: ['logo'],
            size: [100, 30]
        })
        this.surface.add(this.logo)

        this.avatar = new Surface({
            classes: ['avatar'],
            size: [35, 35],
            properties: {
                backgroundImage: this.options.avatarImage
            }
        })
        this.surface.add(this.avatar)

        this.modifier = new Modifier()
        this.add(this.modifier).add(this.surface)
        //this._initParallax()
    }

    inherits(Header, View)
    module.exports = Header

    Header.DEFAULT_OPTIONS = {
        height: 0.4
    }

    Header.prototype._onClick = function(e) {
        if (e.target.classList.contains('avatar')) {
            console.log('avatar')
        }
    }

    Header.prototype._initParallax = function() {
        var y = 0
        var maxY = this.surface.getSize()[1]
        var minY = 0

        var opacity = 1
        var maxOpacity = 1
        var minOpacity = 0.3

        // ScrollView events are piped to header.
        this.on('update', function(e) {
            y -= Math.round(e.delta / 3)
            if (y > maxY) y = maxY
            if (y < minY) y = 0
            if (y < maxY && y > minY) {
                this.modifier.transformFrom(Transform.translate(0, y ,0))
                opacity = 1 - y / maxY
                if (opacity > maxOpacity) opacity = maxOpacity
                this.modifier.opacityFrom(opacity)
            }
        }.bind(this))
    }
})
