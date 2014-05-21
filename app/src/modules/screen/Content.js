define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function Content() {
    View.apply(this, arguments)
    this.surface = new Surface({
        content: 'Content',
        properties: {
            backgroundColor: 'green'
        }
    })
    this.add(this.surface)
    this.surface.pipe(this)
}

inherits(Content, View)
module.exports = Content
})
