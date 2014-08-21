'use strict'

var Controller = require('backbone.controller')
var inherits = require('inherits')
var _ = require('underscore')

var StreamCollection = require('app/components/stream/collections/Stream')
var BaseTransition = require('app/components/animations/BaseTransition')
var MemoModel = require('app/components/memo/models/Memo')
var Overlay = require('app/components/overlay/Overlay')

var MemosView = require('./views/Memos')

var app = require('app')

function Memos(options) {
    this.routes = {
        'memos': 'memos'
    }
    options = _.extend({}, Memos.DEFAULT_OPTIONS, options)
    this.models = options.models
    this.views = {}
    Controller.call(this, options)
    this.router = this.options.router
    this._reset = false
}
inherits(Memos, Controller)
module.exports = Memos

Memos.prototype.initialize = function() {
    this.collection = new StreamCollection(null, {
        urlRoot: '/api/memos',
        model: MemoModel
    })
    this.views.memo = new MemosView({
        collection: this.collection,
        models: this.models
    })
    this.baseTransition = new BaseTransition()
    this.views.memo.on('menu:change', this._onMenuChange.bind(this))
    // XXX
    // Fix EventProxy
    this.views.memo.on('open', this._onMemoOpen.bind(this))
    app.context
        .on('memos:open', this._onOpen.bind(this))
        .on('fullArticle:close', this._onFullArticleClose.bind(this))
        .on('fullArticle:kiiposted', this._onFullArticleKiiposted.bind(this))

    this.views.overlay = new Overlay()
    app.context.add(this.views.overlay)
}

Memos.prototype.memos = function() {
    app.controller.show(this.views.memo, function() {
        this.views.memo.load({reset: this._reset})
        this._reset = false
    }.bind(this))
}

Memos.prototype._onMenuChange = function(e) {
    app.context.emit(e.name + ':open')
}

Memos.prototype._onOpen = function() {
    this.navigate('memos')
    this.baseTransition.commit(app.controller)
    this.memos()
}

Memos.prototype._onMemoOpen = function(e) {
    this.views.overlay.show()
    app.context.emit('fullArticle:open', e)
}

Memos.prototype._onFullArticleClose = function(e) {
    if (!e.isMemo) return
    this.navigate('memos')
    this.memos()
    this.baseTransition.commit(app.controller)
    this.views.overlay.hide()
}

Memos.prototype._onFullArticleKiiposted = function() {
    this._reset = true
    this.views.memo.loaded = false
}
