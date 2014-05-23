define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function Body() {
    View.apply(this, arguments)
    console.log(this.options)
    this.surface = new Surface({
        properties: {
            top: this.options.headerHeight + 'px'
        },
        classes: ['body']
    })
    this.add(this.surface)
    this.surface.pipe(this)
}

inherits(Body, View)
module.exports = Body

})
