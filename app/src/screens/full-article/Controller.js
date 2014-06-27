define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var LayeredTransition = require('components/animations/LayeredTransition')

    var FullArticleView = require('./views/FullArticle')

    var app = require('app')

    function FullArticle() {
        this.routes = {
            'articles/:id': 'article'
        }
        Controller.apply(this, arguments)
        this.options = _.extend({}, FullArticle.DEFAULT_OPTIONS, this.options)
        this.router = this.options.router
    }

    inherits(FullArticle, Controller)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {}

    FullArticle.prototype.initialize = function() {
        this.layeredTransition = new LayeredTransition({size: app.context.getSize()})
        this.view = new FullArticleView()
        this.view.on('close', function() {
            app.context.emit('fullArticle:close')
        }.bind(this))
        app.context.on('fullArticle:open', this._onOpen.bind(this))
    }

    FullArticle.prototype.article = function(id) {
        this.view.load(id)
        app.controller.show(this.view)
    }

    FullArticle.prototype._onOpen = function(id) {
        this.router.navigate('articles/' + id)
        this.layeredTransition.commit(app.controller)
        this.article(id)
        this.layeredTransition.commit(app.controller, true)
    }
})
