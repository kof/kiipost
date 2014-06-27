define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var StreamCollection = require('components/stream/collections/Stream')
    var BaseTransition = require('components/animations/BaseTransition')

    var MemosView = require('./views/Memos')
    var MemoModel = require('./models/Memo')

    var app = require('app')

    function Memos(options) {
        this.routes = {
            'memos': 'memos'
        }
        options = _.extend({}, Memos.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
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
        app.context.on('memos:open', this._onOpen.bind(this))
    }

    Memos.prototype.memos = function() {
        this.baseTransition.commit(app.controller)

        app.controller.show(this.view, function() {
            this.models.user.isAuthorized.then(this.view.load.bind(this.view))
        }.bind(this))
    }

    Memos.prototype._onMenuChange = function(name) {
        app.context.emit(name + ':open')
    }

    Memos.prototype._onOpen = function() {
        this.router.navigate('memos')
        this.memos()
    }
})
