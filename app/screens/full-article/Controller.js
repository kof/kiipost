'use strict'

var Controller = require('backbone.controller')
var inherits = require('inherits')
var _ = require('underscore')

var LayeredTransition = require('app/components/animations/LayeredTransition')
var SlideTransition = require('app/components/animations/SlideTransition')
var ArticleModel = require('app/components/article/models/Article')
var MemoModel = require('app/components/memo/models/Memo')
var Overlay = require('app/components/overlay/Overlay')

var MemoFullArticleView = require('./views/MemoFullArticle')
var NewFullArticleView = require('./views/NewFullArticle')

var app = require('app')

function FullArticle(options) {
    this.routes = {
        'full-articles/new/:id': 'new',
        'full-articles/memos/:id': 'memos'
    }

    options = _.extend({}, FullArticle.DEFAULT_OPTIONS, options)
    this.models = options.models
    this.views = {}
    Controller.call(this, options)
    this.router = this.options.router
}

inherits(FullArticle, Controller)
module.exports = FullArticle

FullArticle.DEFAULT_OPTIONS = {models: null}

FullArticle.prototype.initialize = function() {
    var size = app.context.getSize()
    this.layeredTransition = new LayeredTransition({size: size})
    this.slideTransition = new SlideTransition({size: size})

    this.views.overlay = new Overlay()
    app.context.add(this.views.overlay)

    app.context.on('fullArticle:open', this._onOpen.bind(this))
}

FullArticle.prototype.new = function(id) {
    this._open({
        id: id,
        isMemo: false,
        overlay: true
    })
}

FullArticle.prototype.memos = function(id) {
    this._open({
        id: id,
        isMemo: true,
        overlay: true
    })
}

FullArticle.prototype._open = function(options, callback) {
    var view = this.views[options.id]
    var isCached = Boolean(view)
    var model = options.model

    if (options.overlay) this.views.overlay.show()

    if (isCached) {
        show.call(this)
    } else {
        view = this.views[options.id] = this._createView(options.id, options.isMemo)
        if (model) {
            if (options.isMemo) {
                model = model.get('articles')[0]
            }
            view.setPreviewContent(model, show.bind(this))
        } else show.call(this)
    }

    function show() {
        app.controller.show(view, function() {
            if (options.overlay) this.views.overlay.hide({duration: 0})
            if (!isCached) this._load(view, options)
            if (callback) callback()
        }.bind(this))
    }
}

FullArticle.prototype._load = function(view, options) {
    var id = options.id
    var isMemo = options.isMemo

    view.spinner.show(true)
    this.models.user.authorize.then(function() {
        var xhr
        var memo = new MemoModel(isMemo ? {_id: id} : {userId: this.models.user.id})
        view.setOptions({models: _({memo: memo}).defaults(this.models)})

        if (isMemo) {
            xhr = memo.fetch().then(function() {
                view.setOptions({model: memo.get('articles')[0]})
                view.setContent()
            })
        } else {
            view.setOptions({model: new ArticleModel({_id: id})})
            xhr = view.model.fetch().then(function() {
                memo.set('articles', [view.model])
                view.setContent()
            })
        }

        xhr.always(view.spinner.hide.bind(view.spinner))
    }.bind(this))
}

FullArticle.prototype._createView = function(id, isMemo) {
    var view

    if (isMemo) view = new MemoFullArticleView({models: this.models})
    else view = new NewFullArticleView({models: this.models})
    view.on('close', this._onClose.bind(this))
    view.on('open', this._onOpenRelated.bind(this))

    return view
}

FullArticle.prototype._onOpen = function(view) {
    var model = view.model
    var isMemo = model.isMemo

    this.layeredTransition.commit(app.controller)
    this._open({
        id: model.id,
        model: model,
        isMemo: isMemo,
        overlay: true
    }, function() {
        this.layeredTransition.commit(app.controller, true)
    }.bind(this))
    this.navigate((isMemo ? 'full-articles/memos' : 'full-articles/new') + '/' + model.id)
}

FullArticle.prototype._onOpenRelated = function(view) {
    var model = view.model
    var isMemo = model.isMemo

    this._scaleStartSize = view.getSize()
    this.slideTransition.commit(app.controller)
    this._open({
        id: model.id,
        model: model,
        isMemo: isMemo
    }, function() {
        this.layeredTransition.commit(app.controller, true)
    }.bind(this))
    this.navigate((isMemo ? 'full-articles/memos' : 'full-articles/new') + '/' + model.id, {replace: true})
}

FullArticle.prototype._onClose = function(model) {
    var isMemo = model.isMemo || (model.parent && model.parent.isMemo)
    this.views.overlay.hide()
    app.context.emit('fullArticle:close', {isMemo: isMemo})
}
