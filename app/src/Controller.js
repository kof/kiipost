define(function(require, exports, module) {

var BackboneController = require('controller')
var inherits = require('inherits')
var context = require('context')

var Discover = require('./screens/discover/Controller')

function Controller(options) {
    BackboneController.apply(this, arguments)
    this.discover = new Discover()
}

inherits(Controller, BackboneController)
module.exports = Controller

})
