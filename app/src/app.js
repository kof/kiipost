define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var ImagesLoader = require('images-loader')

    var Engine = require('famous/core/Engine')

    var DiscoverController = require('./screens/discover/Controller')

    var app = module.exports

    app.options = {router: true}
    app.context = Engine.createContext()

    // One images pool can be used by any component.
    app.imagesLoader = new ImagesLoader()

    var initialized = false

    // Some views require to know the context size immediately.
    app.context.on('resize', function() {
        if (initialized) return
        var discover = new DiscoverController(app.options)
        backbone.history.start()
        initialized = true
    })
})
