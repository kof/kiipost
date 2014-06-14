define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var MemoModel = require('./models/Memo')
    var StreamCollection = require('components/stream/collections/Stream')

    var SavedView = require('./views/Saved')

    function SavedController(options) {
        this.routes = {
            'saved': 'saved'
        }
        options = _.extend({}, SavedController.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }
    inherits(SavedController, Controller)
    module.exports = SavedController

    SavedController.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            basePath: '/api/saved',
            view: 'saved',
            model: MemoModel
        })
        this.view = new SavedView({
            collection: this.collection,
            models: this.models
        })
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    SavedController.prototype.saved = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('saved')
        }.bind(this))
        this.models.user.isAuthorized.then(this.view.load.bind(this.view))
    }

    SavedController.prototype._onMenuChange = function(name) {
        this.router.navigate(name, {trigger: true})
        // XXX dirty
        // Wait until animation on the next screen is done.
        setTimeout(function() {
            this.view.menu.select(name)
        }.bind(this), 500)
    }
})
