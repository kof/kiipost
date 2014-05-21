/* globals define */
define(function(require, exports, module) {
'use strict'

var FastClick = require('famous/inputs/FastClick')
var Backbone = require('backbone')
var Controller = require('./Controller')

new Controller({router: true})
Backbone.history.start()

})
