define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var ImagesLoader = require('images-loader')

    var Engine = require('famous/core/Engine')
    var RenderController = require('famous/views/RenderController')

    var DiscoverController = require('./screens/discover/DiscoverController')
    var ArticleController = require('./screens/article/ArticleController')
    var BackgroundView = require('components/background/Background')

    var app = module.exports

    app.GOLDEN_RATIO = 0.618

    app.options = {router: true}
    app.context = Engine.createContext()

    app.imagesLoader = new ImagesLoader()

    app.renderController = new RenderController()
    app.context.add(app.renderController)

    // Background view is accessing app.context.
    setTimeout(function() {
        app.context.add(new BackgroundView())
    }, 10)

    var initialized = false

    // Some views require to know the context size immediately.
    app.context.on('resize', function() {
        if (initialized) return
        var discover = new DiscoverController(app.options)
        var article = new ArticleController(app.options)
        backbone.history.start()
        initialized = true
    })
})
