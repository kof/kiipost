define(function(require, exports, module) {

var BackboneController = require('controller')
var inherits = require('inherits')
var context = require('context')

var DiscoverView = require('./views/Discover')

function Controller(options) {
    this.routes = {
        '': 'discover',
        '/': 'discover'
    }
    BackboneController.apply(this, arguments)
}
inherits(Controller, BackboneController)
module.exports = Controller

Controller.prototype.initialize = function() {
    this.view = new DiscoverView()
}

Controller.prototype.discover = function() {
    context.add(this.view)
}

})
