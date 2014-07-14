define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var StreamCollection = require('components/stream/collections/Stream')
    var BaseTransition = require('components/animations/BaseTransition')
    var MemoModel = require('components/memo/models/Memo')

    var MemosView = require('./views/Memos')

    var app = require('app')

    function Memos(options) {
        this.routes = {
            'memos': 'memos'
        }
        options = _.extend({}, Memos.DEFAULT_OPTIONS, options)
        this.models = options.models
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
        this.view = new MemosView({
            collection: this.collection,
            models: this.models
        })
        this.baseTransition = new BaseTransition()
        this.view.on('menu:change', this._onMenuChange.bind(this))
        // XXX
        // Fix EventProxy
        this.view.on('open', this._onMemoOpen.bind(this))
        app.context
            .on('memos:open', this._onOpen.bind(this))
            .on('fullArticle:close', this._onFullArticleClose.bind(this))
            .on('fullArticle:kiiposted', this._onFullArticleKiiposted.bind(this))
    }

    Memos.prototype.memos = function() {
        app.controller.show(this.view, function() {
            this.view.load({reset: this._reset})
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
        app.context.emit('fullArticle:open', e)
    }

    Memos.prototype._onFullArticleClose = function(e) {
        if (!e.isMemo) return
        this.navigate('memos')
        this.memos()
        this.baseTransition.commit(app.controller)
    }

    Memos.prototype._onFullArticleKiiposted = function(e) {
        this._reset = true
        this.view.loaded = false
    }
})
