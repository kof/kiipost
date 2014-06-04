define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var ImagesLoader = require('images-loader')

    var Engine = require('famous/core/Engine')
    var RenderController = require('famous/views/RenderController')

    var LoginController = require('./screens/login/LoginController')
    var DiscoverController = require('./screens/discover/DiscoverController')
    var ArticleController = require('./screens/article/ArticleController')
    var SavedController = require('./screens/saved/SavedController')

    var app = module.exports

    app.GOLDEN_RATIO = 0.618

    app.context = Engine.createContext()

    app.imagesLoader = new ImagesLoader()

    app.controller = new RenderController()
    app.context.add(app.controller)

    window.addEventListener('deviceorientation', function(e) {
        app.context.emit('deviceorientation', e)
    })

    var initialized = false

    // Some views require to know the context size immediately.
    app.context.on('resize', function() {
        if (initialized) return
        var options = {router: true}

        var login = new LoginController(options)
        var discover = new DiscoverController(options)
        var article = new ArticleController(options)
        var saved = new SavedController(options)
        initialized = true
        backbone.history.start()
    })
})
