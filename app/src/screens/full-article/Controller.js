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
            app.context.emit('fullArticle:close', {isMemo: this.isMemo})
        }.bind(this))
        app.context.on('fullArticle:open', this._onOpen.bind(this))
    }

    FullArticle.prototype.article = function(id) {
        this._show(id, false)
    }

    FullArticle.prototype.memo = function(id) {
        this._show(id, true)
    }

    FullArticle.prototype._show = function(id, isMemo, model, callback) {
        function show() {
            app.controller.show(this.view, load.bind(this))
        }

        function load() {
            if (id != prev) this._load(id, isMemo)
            if (callback) callback()
        }

        var prev = this.current
        this.current = id
        if (id != prev) this.view.cleanup()
        model = isMemo ? model.get('articles')[0] : model
        model ? this.view.setPreviewContent(model, show.bind(this)) : show.call(this)
    }

    FullArticle.prototype._load = function(id, isMemo) {
        var view = this.view

        this.isMemo = isMemo
        view.setOptions({hasKiipostBtn: !isMemo})
        view.spinner.show()
        this.models.user.authorize.then(function() {
            var xhr
            var memo = new MemoModel(isMemo ? {_id: id} : {userId: this.models.user.id})
            view.setOptions({models: _.defaults({memo: memo}, view.models)})

            if (isMemo) {
                xhr = memo
                    .fetch()
                    .then(function() {
                        this.model = memo.get('articles')[0]
                        this.setContent()
                    }.bind(view))
            } else {
                view.model = new ArticleModel({_id: id})
                xhr = view.model.fetch().then(function() {
                    memo.set('articles', [view.model])
                    view.setContent()
                })
            }

            xhr.always(view.spinner.hide.bind(view.spinner))
        }.bind(this))
    }


    FullArticle.prototype._onOpen = function(model) {
        var isMemo = model.constructor.name == 'Memo'

        this.layeredTransition.commit(app.controller)
        this._show(model.id, isMemo, model, function() {
            this.layeredTransition.commit(app.controller, true)
        }.bind(this))
        this.router.navigate((isMemo ? 'memos' : 'articles') + '/' + model.id)
    }
})
