define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Group = require('famous/core/Group')
var Surface = require('famous/core/Surface')
var FlexibleLayout = require('famous/views/FlexibleLayout')

var inherits = require('inherits')
var mustache = require('mustache')
var tpl = mustache.compile(require('../templates/stream-item.html'))

function StreamItem() {

    View.apply(this, arguments)
    this.model = this.options.model

    this.surface = new Surface({
        content: tpl.render(this.model),
        size: [undefined, 200],
        properties: {},
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
