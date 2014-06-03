define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var ArticleModel = require('components/article/models/Article')
    var StreamCollection = require('components/stream/collections/Stream')

    var SavedView = require('./views/Saved')

    function SavedController(options) {
        this.routes = {
            'saved': 'saved'
        }
        Controller.apply(this, arguments)
        this.router = this.options.router
    }
    inherits(SavedController, Controller)
    module.exports = SavedController

    SavedController.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            basePath: '/api/saved',
            view: 'saved',
            model: ArticleModel
        })
        this.view = new SavedView({collection: this.collection})
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    SavedController.prototype.saved = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('saved')
        }.bind(this))
    }

    SavedController.prototype._onMenuChange = function(name) {
        this.router.navigate(name, {trigger: true})
        // XXX dirty
        // Wait until animation on the next screen is done.
        setTimeout(function() {
            this.view.menu.select(name)
        }.bind(this), 500)
    }
})
