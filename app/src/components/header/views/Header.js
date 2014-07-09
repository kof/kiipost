define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier  = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    var constants = require('constants')

    function Header() {
        View.apply(this, arguments)

        var size = this.options.context.getSize()

        // Height is the golden ratio.
        this.options.size = [size[0], constants.BRULE_RATIO * size[0]]
        this.models = this.options.models

        this.surface = new ContainerSurface({
            size: this.options.size,
            classes: ['header']
        })
        this.surface.pipe(this._eventOutput)
        this.surface.on('click', this._onClick.bind(this))
        this.add(this.surface)

        this.logo = new Surface({
            classes: ['logo'],
            size: [true, true]
        })
        this.surface.add(this.logo)
        /*
        this.avatar = new Surface({
            classes: ['avatar'],
            size: [true, true]
        })
        this.surface.add(this.avatar)
        */

        this.title = new Surface({
            classes: ['title'],
            size: [undefined, 30],
            content: this.options.title
        })
        this.surface.add(this.title)

        this.models.user.on('change:imageUrl', this._onAvatarChange.bind(this))
    }

    inherits(Header, View)
    module.exports = Header

    Header.DEFAULT_OPTIONS = {
        title: 'Home',
        models: null
    }

    Header.prototype.setAvatarUrl = function(url) {
        //this.avatar.setProperties({backgroundImage: 'url(' + url + ')'})
    }

    Header.prototype._onClick = function(e) {
        if (e.target.classList.contains('avatar')) {
            console.log('avatar')
        }
    }

    Header.prototype._onAvatarChange = function(model, url) {
        this.setAvatarUrl(url)
    }
})
