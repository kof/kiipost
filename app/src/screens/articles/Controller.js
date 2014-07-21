define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleModel = require('components/article/models/Article')
    var StreamCollection = require('components/stream/collections/Stream')

    var ArticlesView = require('./views/Articles')

    function Articles(options) {
        this.routes = {
            'articles': 'articles'
        }
        options = _.extend({}, Articles.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }
    inherits(Articles, Controller)
    module.exports = Articles

    Articles.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            urlRoot: '/api/articles',
            model: ArticleModel
        })
        this.view = new ArticlesView({
            collection: this.collection,
            models: this.models
        })
        this.view.on('menu:change', this._onMenuChange.bind(this))
        // XXX
        // Fix EventProxy
        this.view.on('open', this._onArticleOpen.bind(this))
        app.context
            .on('fullArticle:close', this._onFullArticleClose.bind(this))
            .on('articles:open', this._onOpen.bind(this))
    }

    Articles.prototype.articles = function() {
        app.controller.show(this.view, this.view.load.bind(this.view))
    }

    Articles.prototype._onMenuChange = function(e) {
        app.context.emit(e.name + ':open')
    }

    Articles.prototype._onArticleOpen = function(e) {
        app.context.emit('fullArticle:open', e)
    }

    Articles.prototype._onFullArticleClose = function(e) {
        if (e.isMemo) return
        this.navigate('articles')
        this.articles()
    }

    Articles.prototype._onOpen = function() {
        this.navigate('articles')
        this.articles()
    }
})
