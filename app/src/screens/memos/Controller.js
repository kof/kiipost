define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var MemoModel = require('./models/Memo')
    var StreamCollection = require('components/stream/collections/Stream')

    var MemosView = require('./views/Memos')

    function Memos(options) {
        this.routes = {
            'saved': 'saved'
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
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    Memos.prototype.saved = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('saved')
        }.bind(this))
        this.models.user.isAuthorized.then(this.view.load.bind(this.view))
    }

    Memos.prototype._onMenuChange = function(name) {
        this.router.navigate(name, {trigger: true})
        // XXX dirty
        // Wait until animation on the next screen is done.
        setTimeout(function() {
            this.view.menu.select(name)
        }.bind(this), 500)
    }
})
