define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleModel = require('components/article/models/Article')
    var StreamCollection = require('components/stream/collections/Stream')

    var ArticlesView = require('./views/Articles')

    function Articles(options) {
        this.routes = {
            'discover': 'discover'
        }
        options = _.extend({}, Articles.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }
    inherits(Articles, Controller)
    module.exports = Articles

    Articles.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            urlRoot: '/api/articles',
            model: ArticleModel
        })
        this.view = new ArticlesView({
            collection: this.collection,
            models: this.models
        })
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    Articles.prototype.discover = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('discover')
        }.bind(this))
        this.models.user.isAuthorized.then(this.view.load.bind(this.view))
    }

    Articles.prototype._onMenuChange = function(name) {
        this.view.menu.select(name)
        this.router.navigate(name, {trigger: true})
    }
})
