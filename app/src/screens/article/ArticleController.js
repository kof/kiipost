define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleModel = require('components/stream/collections/Stream')

    var ArticleView = require('./views/Article')

    function ArticleController(options) {
        this.routes = {
            'article/:id': 'article',
            'article/:id/': 'article'
        }
        Controller.apply(this, arguments)
        app.context.on('article:open', this._onOpen.bind(this))
    }

    inherits(ArticleController, Controller)
    module.exports = ArticleController

    ArticleController.prototype.initialize = function() {
        this.view = new ArticleView()
    }

    ArticleController.prototype.article = function(id) {
        console.log('article', id)
        app.context.add(this.view)
    }

    ArticleController.prototype._onOpen = function(model) {
        console.log('open', model)
        this.view.model = model
        this.view.show()
        this.options.router.navigate('/article/' + model.id, {trigger: true})
    }
})
