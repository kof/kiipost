define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')

    var Engine = require('famous/core/Engine')

    var DiscoverController = require('./screens/discover/Controller')

    var app = module.exports

    app.options = {router: true}
    app.context = Engine.createContext()

    var discover = new DiscoverController(app.options)
    backbone.history.start()
})
