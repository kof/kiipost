define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')
var mustache = require('mustache')

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
    this.add(this.surface)
    this.surface.pipe(this)

    this.menu = new Menu({headerHeight: this.getSize()[1]})
    this.add(this.menu)
    this.menu._eventInput.pipe(this)
}

inherits(Header, View)
module.exports = Header

Header.DEFAULT_OPTIONS = {
    size: [undefined, 200],
    backgroundImage: null,
    avatarImage: 'content/images/dummy-avatar.png'
}


Header

})

