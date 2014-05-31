define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleModel = require('./models/Article')
    var ArticleView = require('./views/Article')

    function ArticleController() {
        this.routes = {
            'article/:id': 'article'
        }
        Controller.apply(this, arguments)
        this.options = _.extend({}, ArticleController.DEFAULT_OPTIONS, this.options)
        this.router = this.options.router
        app.context.on('article:open', this._onOpen.bind(this))
    }

    inherits(ArticleController, Controller)
    module.exports = ArticleController

    ArticleController.DEFAULT_OPTIONS = {
        duration: 150
    }

    ArticleController.prototype.initialize = function() {
        this.view = new ArticleView()
        this.view.on('close', function() {
            this.router.navigate('/', {trigger: true})
        }.bind(this))
    }

    ArticleController.prototype.article = function(model) {
        if (typeof model == 'string') {
            this.view.load(model)
        } else {
            this.view.setContent(model)
        }
        app.controller.show(this.view, this.options)
    }

    ArticleController.prototype._onOpen = function(model) {
        this.router.navigate('/article/' + model.id)
        this.article(model)
    }
})
