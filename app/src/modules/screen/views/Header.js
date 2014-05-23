define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function Header() {
    View.apply(this, arguments)
    this.front = new Surface({
        size: this.options.size,
        classes: ['header']
    })
    this.add(this.front)
    this.front.pipe(this)
}

inherits(Header, View)
module.exports = Header

Header.DEFAULT_OPTIONS = {
    size: [undefined, 300]
}

Header.prototype.setBgImage = function(url) {
    this.front.setProperties({backgroundImage: 'url(' + url + ')'})
}

})

