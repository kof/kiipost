define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var Logo = require('./Logo')
var Avatar = require('./Avatar')
var Menu = require('./Menu')

function Header() {
    View.apply(this, arguments)
    this.surface = new Surface({
        size: this.options.size,
        classes: ['header']
    })
    this.add(this.surface)
    this.surface.pipe(this)

    this.logo = new Logo()
    this.avatar = new Avatar()
    this.menu = new Menu({headerHeight: this.getSize()[1]})

    // Connect elements.
    ;[this.logo, this.avatar, this.menu].forEach(function(view) {
        this.add(view)
        view._eventInput.pipe(this)
    }, this)
}

inherits(Header, View)
module.exports = Header

Header.DEFAULT_OPTIONS = {
    size: [undefined, 300]
}

Header.prototype.setBgImage = function(url) {
    this.surface.setProperties({backgroundImage: 'url(' + url + ')'})
}

})

