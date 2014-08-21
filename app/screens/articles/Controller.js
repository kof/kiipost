'use strict'

var Controller = require('backbone.controller')
var inherits = require('inherits')
var _ = require('underscore')

var app = require('app')

var ArticleModel = require('app/components/article/models/Article')
var StreamCollection = require('app/components/stream/collections/Stream')
var Overlay = require('app/components/overlay/Overlay')

var ArticlesView = require('./views/Articles')

function Articles(options) {
    this.routes = {
        'articles': 'articles'
    }
    options = _.extend({}, Articles.DEFAULT_OPTIONS, options)
    this.models = options.models
    this.views = {}
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
    this.views.articles = new ArticlesView({
        collection: this.collection,
        models: this.models
    })
    this.views.articles.on('menu:change', this._onMenuChange.bind(this))
    // XXX
    // Fix EventProxy
    this.views.articles.on('open', this._onArticleOpen.bind(this))
    app.context
        .on('fullArticle:close', this._onFullArticleClose.bind(this))
        .on('articles:open', this._onOpen.bind(this))

    this.views.overlay = new Overlay()
    app.context.add(this.views.overlay)
}

Articles.prototype.articles = function() {
    var articles = this.views.articles
    app.controller.show(articles, articles.load.bind(articles))
}

Articles.prototype._onMenuChange = function(e) {
    app.context.emit(e.name + ':open')
}

Articles.prototype._onArticleOpen = function(e) {
    this.views.overlay.show()
    app.context.emit('fullArticle:open', e)
}

Articles.prototype._onFullArticleClose = function(e) {
    if (e.isMemo) return
    this.navigate('articles')
    this.views.overlay.hide()
    this.articles()
}

Articles.prototype._onOpen = function() {
    this.navigate('articles')
    this.articles()
}
