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

exports.imagesLoader = new ImagesLoader()

exports.controller = new RenderController()
new BaseTransition().commit(exports.controller)

exports.controllers = {}

domready(function() {
    var context = exports.context = Engine.createContext()
    context.add(exports.controller)

    var contextready = new Promise(function(fulfill) {
        context.on('resize', fulfill)
    })

    Promise.all([deviceready, contextready]).then(function() {
        var options = {router: true, models: {}}

        options.models.user = new UserModel()

        exports.controllers.signin = new SigninController(options)
        exports.controllers.articles = new ArticlesController(options)
        exports.controllers.memos = new MemosController(options)
        exports.controllers.fullArticle = new FullArticleController(options)

        backbone.history.start()
        if (backbone.history.getFragment()) exports.controllers.signin.do()
    })
})
