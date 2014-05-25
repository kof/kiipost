define(function(require, exports, module) {
    'use strict'

    var BackboneController = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var Collection = require('components/stream/collections/Stream')

    var DiscoverView = require('./views/Discover')

    function Controller(options) {
        this.options = _.extend({}, Controller.DEFAULT_OPTIONS, options)
        this.routes = {
            '': 'discover',
            '/': 'discover'
        }
        BackboneController.apply(this, arguments)
    }
    inherits(Controller, BackboneController)
    module.exports = Controller

    Controller.DEFAULT_OPTIONS = {}

    Controller.prototype.initialize = function() {
        this.collection = new Collection(null, {
            basePath: '/api/discover',
            view: 'gallery'
        })
        this.view = new DiscoverView({collection: this.collection})
    }

    Controller.prototype.discover = function() {
        app.context.add(this.view)
    }
})
