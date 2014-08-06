'use strict'

/**
 * Global app object.
 */

var backbone = require('backbone')
var ImagesLoader = require('images-loader')
var domready = require('domready')

var Engine = require('famous/core/Engine')
var RenderController = require('famous/views/RenderController')

var UserModel = require('./components/user/models/User')
var BaseTransition = require('./components/animations/BaseTransition')
var deviceready = require('./components/deviceready')

var SigninController = require('./screens/signin/Controller')
var ArticlesController = require('./screens/articles/Controller')
var FullArticleController = require('./screens/full-article/Controller')
var MemosController = require('./screens/memos/Controller')

var context = exports.context = Engine.createContext()

exports.imagesLoader = new ImagesLoader()

exports.controller = new RenderController()
new BaseTransition().commit(exports.controller)

context.add(exports.controller)

exports.ready = new Promise(function(fulfill, reject) {
    var isResized
    var isDomReady
    var isDeviceReady = !window.cordova

    context.on('resize', function() {
        isResized = true
        resolve()
    })

    domready(function() {
        isDomReady = true
        resolve()
    })

    deviceready.then(function() {
        isDeviceReady = true
        resolve()
    })

    function resolve() {
        if (isResized && isDomReady && isDeviceReady) fulfill()
    }
})

exports.controllers = {}

// Some views require to know the context size immediately.
exports.ready.then(function() {
    var options = {router: true, models: {}}

    options.models.user = new UserModel()

    exports.controllers.signin = new SigninController(options)
    exports.controllers.articles = new ArticlesController(options)
    exports.controllers.fullArticle = new FullArticleController(options)
    exports.controllers.memos = new MemosController(options)

    backbone.history.start()
    if (backbone.history.getFragment()) exports.controllers.signin.do()
})
