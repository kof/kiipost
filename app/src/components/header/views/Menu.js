define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var tpl = require('../templates/menu.html')

function Menu() {
    View.apply(this, arguments)
    this.surface = new Surface({
        content: tpl,
        size: this.options.size,
        properties: {
            top: this.options.headerHeight - this.options.size[1] + 'px'
        },
        classes: ['menu']
    })
    this.add(this.surface)
    this.surface.pipe(this)
}

inherits(Menu, View)
module.exports = Menu

Menu.DEFAULT_OPTIONS = {
    size: [undefined, 50],
    headerHeight: null
}
})



