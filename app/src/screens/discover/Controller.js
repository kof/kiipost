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
    this.view = new DiscoverView()
}

inherits(Controller, BackboneController)
module.exports = Controller

Controller.prototype.discover = function() {
    console.log('discover')
}
})
