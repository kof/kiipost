define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function StreamItem() {
    View.apply(this, arguments)
    this.model = this.options.model
    this.surface = new Surface({
        content: this.model.title,
        size: [undefined, 100],
        properties: {
        },
        classes: ['stream-item']
    })
    this.add(this.surface)
    this.surface.pipe(this)
}

inherits(StreamItem, View)
module.exports = StreamItem

StreamItem.DEFAULT_OPTIONS = {
    model: null
}


})
