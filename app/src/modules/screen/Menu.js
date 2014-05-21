define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var OptionsManager = require('famous/core/OptionsManager')
var inherits = require('inherits')

function Menu(options) {
    if (!options) options = {}

    OptionsManager.patch(options, Menu.defaults)
    View.call(this, options)
    this.surface = new Surface({
        content: 'Menu',
        size: [undefined, 40],
        properties: {
            backgroundColor: 'yellow',
            top: '160px',
            zIndex: 1,
            classes: ['menu']
        }
    })
    this.add(this.surface)
    this.surface.pipe(this)
}

inherits(Menu, View)
module.exports = Menu

Menu.defaults = {
    tpl: '<div class="menu">saved | discover</div>'
}
})



