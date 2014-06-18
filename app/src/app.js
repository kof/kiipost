define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var ImagesLoader = require('images-loader')
    var domready = require('domready')

    var Engine = require('famous/core/Engine')
    var RenderController = require('famous/views/RenderController')

    var UserModel = require('components/user/models/User')

    var SigninController = require('./screens/signin/Controller')
    var ArticlesController = require('./screens/articles/Controller')
    var ArticleController = require('./screens/article/Controller')
    var MemosController = require('./screens/memos/Controller')

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
        var articles = new ArticlesController(options)
        var article = new ArticleController(options)
        var memos = new MemosController(options)

        backbone.history.start()
    })
})
