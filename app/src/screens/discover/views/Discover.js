define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var Screen = require('modules/screen/Screen')

function Discover() {
    Screen.apply(this, arguments)
}

inherits(Discover, Screen)
module.exports = Discover

})
