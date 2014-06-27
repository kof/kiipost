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
    var FullArticleController = require('./screens/full-article/Controller')
    var MemosController = require('./screens/memos/Controller')

    exports.GOLDEN_RATIO = 0.618

    var context = exports.context = Engine.createContext()

    exports.imagesLoader = new ImagesLoader()

    exports.controller = new RenderController()
    context.add(exports.controller)

    window.addEventListener('deviceorientation', function(e) {
        context.emit('deviceorientation', e)
    })

    exports.ready = new Promise(function(fulfill, reject) {
        var isResized, isDomReady
        var isDeviceReady = !window.cordova

        context.on('resize', function() {
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
    exports.ready.then(function() {
        var options = {router: true, models: {}}

        options.models.user = new UserModel()

        var signin = new SigninController(options)
        var articles = new ArticlesController(options)
        var article = new FullArticleController(options)
        var memos = new MemosController(options)

        backbone.history.start()
    })
})
