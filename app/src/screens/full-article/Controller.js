define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var LayeredTransition = require('components/animations/LayeredTransition')
    var ArticleModel = require('components/article/models/Article')
    var MemoModel = require('components/memo/models/Memo')

    var FullArticleView = require('./views/FullArticle')

    var app = require('app')

    function FullArticle(options) {
        this.routes = {
            'articles/:id': 'article',
            'memos/:id': 'memo'
        }

        options = _.extend({}, FullArticle.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }

    inherits(FullArticle, Controller)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {models: null}

    FullArticle.prototype.initialize = function() {
        this.layeredTransition = new LayeredTransition({size: app.context.getSize()})
        this.view = new FullArticleView({models: this.models})
        this.view.on('close', function() {
            app.context.emit('fullArticle:close', {isMemo: this.view.isMemo})
        }.bind(this))
        app.context.on('fullArticle:open', this._onOpen.bind(this))
    }

    FullArticle.prototype.article = function(id) {
        app.controller.show(this.view, function() {
            this.load(id, false)
        }.bind(this))
    }

    FullArticle.prototype.memo = function(id) {
        app.controller.show(this.view, function() {
            this.load(id, true)
        }.bind(this))
    }

    FullArticle.prototype.load = function(id, isMemo) {
        var view = this.view

        view.isMemo = isMemo
        view.spinner.show()
        this.models.user.authorize.then(function() {
            var xhr

            if (isMemo) {
                var memo = view.models.memo = new MemoModel({_id: id})
                xhr = memo
                    .fetch()
                    .then(function() {
                        this.model = memo.get('articles')[0]
                        this.setContent()
                    }.bind(view))
            } else {
                view.model = new ArticleModel({_id: id})
                xhr = view.model.fetch().then(view.setContent.bind(view))
            }

            xhr.always(view.spinner.hide.bind(view.spinner))
        }.bind(this))
    }


    FullArticle.prototype._onOpen = function(model) {
        var route
        this.layeredTransition.commit(app.controller)
        if (model.constructor.name == 'Memo') {
            route = 'memos'
            this.memo(model.id)
        } else {
            route = 'articles'
            this.article(model.id)
        }
        this.router.navigate(route + '/' + model.id)
        this.layeredTransition.commit(app.controller, true)
    }
})
