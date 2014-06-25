define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var FullArticleView = require('./views/FullArticle')

    function FullArticle() {
        this.routes = {
            'articles/:id': 'article'
        }
        Controller.apply(this, arguments)
        this.options = _.extend({}, FullArticle.DEFAULT_OPTIONS, this.options)
        this.router = this.options.router
        app.context.on('discover:open', this._onOpen.bind(this))
    }

    inherits(FullArticle, Controller)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {
        duration: 150
    }

    FullArticle.prototype.initialize = function() {
        this.view = new FullArticleView()
        this.view.on('close', function() {
            this.router.navigate('discover', {trigger: true})
        }.bind(this))
    }

    FullArticle.prototype.article = function(id) {
        this.view.load(id)
        app.controller.show(this.view, this.options)
    }

    FullArticle.prototype._onOpen = function(model) {
        this.router.navigate('/article/' + model.id)
        this.article(model.id)
    }
})
