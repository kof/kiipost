define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')
var mustache = require('mustache')
var Modifier  = require("famous/core/Modifier")
var Transform = require("famous/core/Transform")

var Menu = require('./Menu')

var tpl = mustache.compile(require('../templates/header.html'))

function Header() {
    View.apply(this, arguments)
    this.surface = new Surface({
        content: tpl.render(this.options),
        size: this.options.size,
        classes: ['header'],
        properties: {
            backgroundImage: 'url(' + this.options.backgroundImage + ')'
        }
    })
    this.modifier = new Modifier();
    this.add(this.modifier).add(this.surface)
    this.surface.pipe(this)
    this.surface.on('click', this._onClick.bind(this))
    this.menu = new Menu({headerHeight: this.getSize()[1]})
    this.add(this.menu)
    this.menu._eventInput.pipe(this)
    this._initParallax()
}

inherits(Header, View)
module.exports = Header

Header.DEFAULT_OPTIONS = {
    size: [undefined, 200],
    backgroundImage: null,
    avatarImage: 'content/images/dummy-avatar.png'
}

Header.prototype._onClick = function(e) {
    if (e.target.className == 'avatar') {
        console.log('avatar')
    }
}

Header.prototype._initParallax = function() {
    var y = 0
    var maxY = this.getSize()[1]
    var minY = 0

    var opacity = 1
    var maxOpacity = 1
    var minOpacity = 0.3

    this.on('update', function(e) {
        y -= Math.round(e.delta / 3)
        if (y > maxY) y = maxY
        if (y < minY) y = 0
        if (y < maxY && y > minY) {
            this.modifier.transformFrom(Transform.translate(0, y ,0))
            opacity = 1 - y / maxY
            if (opacity > maxOpacity) opacity = maxOpacity
            if (opacity < minOpacity) opacity = minOpacity
            this.modifier.opacityFrom(opacity)
        }
    }.bind(this))
}

})

