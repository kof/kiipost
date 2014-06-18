define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleView = require('./views/Article')

    function Article() {
        this.routes = {
            'article/:id': 'article'
        }
        Controller.apply(this, arguments)
        this.options = _.extend({}, Article.DEFAULT_OPTIONS, this.options)
        this.router = this.options.router
        app.context.on('discover:open', this._onOpen.bind(this))
    }

    inherits(Article, Controller)
    module.exports = Article

    Article.DEFAULT_OPTIONS = {
        duration: 150
    }

    Article.prototype.initialize = function() {
        this.view = new ArticleView()
        this.view.on('close', function() {
            this.router.navigate('discover', {trigger: true})
        }.bind(this))
    }

    Article.prototype.article = function(id) {
        this.view.load(id)
        app.controller.show(this.view, this.options)
    }

    Article.prototype._onOpen = function(model) {
        this.router.navigate('/article/' + model.id)
        this.article(model.id)
    }
})
