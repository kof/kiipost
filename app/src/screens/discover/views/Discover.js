define(function(require, exports, module) {
'use strict'

var Backbone = require('backbone')
var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var Screen = require('modules/screen/Screen')
var StreamView = require('modules/stream/views/Stream')

function Discover() {
    Backbone.View.apply(this, arguments)
    this.screen = new Screen()
}

inherits(Discover, Backbone.View)
module.exports = Discover

Discover.prototype.initialize = function() {
   // console.log(IScroll)
}

})
