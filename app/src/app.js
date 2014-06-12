define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var ImagesLoader = require('images-loader')
    var domready = require('domready')

    var Engine = require('famous/core/Engine')
    var RenderController = require('famous/views/RenderController')

    var UserModel = require('components/user/models/User')

    var SigninController = require('./screens/signin/SigninController')
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

    app.ready = new Promise(function(fulfill, reject) {
        var isResized, isDomReady
        var isDeviceReady = !window.cordova

        app.context.on('resize', function() {
            isResized = true
            resolve()
        })

        domready(function() {
            isDomReady = true
            resolve()
        })

        document.addEventListener('deviceready', function() {
            isDeviceReady = true
            resolve()
        })

        function resolve() {
            if (isResized && isDomReady && isDeviceReady) fulfill()
        }
    })

    // Some views require to know the context size immediately.
    app.ready.then(function() {
        var options = {router: true, models: {}}

        options.models.user = new UserModel()

        var signin = new SigninController(options)
        var discover = new DiscoverController(options)
        var article = new ArticleController(options)
        var saved = new SavedController(options)

        backbone.history.start()
    })
})
