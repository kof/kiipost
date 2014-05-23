define(function(require, exports, module) {

var BackboneController = require('controller')
var inherits = require('inherits')
var DiscoverController = require('./screens/discover/Controller')

function Controller(options) {
    BackboneController.apply(this, arguments)
    this.discover = new DiscoverController(options)
}

inherits(Controller, BackboneController)
module.exports = Controller

})
