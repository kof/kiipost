define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var ScreenView = require('modules/screen/views/Screen')
var StreamView = require('modules/stream/views/Stream')

function Discover() {
    View.apply(this, arguments)
}

inherits(Discover, View)
module.exports = Discover

Discover.DEFAULT_OPTIONS = {
    headerBg: 'content/images/discover-header.jpg'
}

Discover.prototype.initialize = function() {
    this.screen = new ScreenView()
    this.stream = new StreamView({headerHeight: this.screen.header.getSize()[1]})
    this.screen.body.add(this.stream)
    this.stream._eventInput.pipe(this.screen.body)
    this.screen.header.setBgImage(this.options.headerBg)
}

})
