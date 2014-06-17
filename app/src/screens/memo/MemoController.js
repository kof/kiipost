define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var MemoModel = require('./models/Memo')
    var StreamCollection = require('components/stream/collections/Stream')

    var MemoView = require('./views/Memo')

    function MemoController(options) {
        this.routes = {
            'saved': 'saved'
        }
        options = _.extend({}, MemoController.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }
    inherits(MemoController, Controller)
    module.exports = MemoController

    MemoController.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            basePath: '/api/memo',
            model: MemoModel
        })
        this.view = new MemoView({
            collection: this.collection,
            models: this.models
        })
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    MemoController.prototype.saved = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('saved')
        }.bind(this))
        this.models.user.isAuthorized.then(this.view.load.bind(this.view))
    }

    MemoController.prototype._onMenuChange = function(name) {
        this.router.navigate(name, {trigger: true})
        // XXX dirty
        // Wait until animation on the next screen is done.
        setTimeout(function() {
            this.view.menu.select(name)
        }.bind(this), 500)
    }
})
