define(function(require, exports, module) {
    'use strict'

    var $ = require('jquery')
    var mustache = require('mustache')
    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var InfiniteScrollView  = require('famous-infinitescroll')

    var app = require('app')

    var streamTpl = mustache.compile(require('../templates/stream.html'))

    /**
     * Infinite list.
     *
     * @param {Object} options overrides Stream.defaults
     * @api public
     */
    function Stream() {
        View.apply(this, arguments)

        var contextHeight = app.context.getSize()[1]

        this.collection = this.options.collection
        this.views = this.options.views
        this._initialViewsAmount = this.views.length
        this.scrollview = new InfiniteScrollView({
            // Trigger infiniteScroll event 5 screens before items actually get rendered.
            offset: contextHeight * 5,
            // Height of the full scroller, factor 2 to render invisible items
            // before they get shown.
            margin: contextHeight * 2
        })
        this.add(this.scrollview)
        this.scrollview.sequenceFrom(this.views)

        this.scrollview.on('infiniteScroll', this.load.bind(this))
        // Make stream emit scrollview events.
        this.scrollview._eventInput.pipe(this._eventOutput)
        this.collection.on('sync', this._onSync.bind(this))
        this.load()
    }

    inherits(Stream, View)
    module.exports = Stream

    Stream.DEFAULT_OPTIONS = {
        ItemView: null,
        views: null
    }

    Stream.prototype.load = function() {
        if (this.loading) return
        this.loading = true
        this.scrollview.infiniteScrollDisabled = true
        // Minus views added before scroll items.
        this.collection.options.skip = this.views.length - this._initialViewsAmount
        this.collection.fetch()
    }

    Stream.prototype.setContent = function() {
        var ItemView = this.options.ItemView

        this.collection.forEach(function(model) {
            var view = new ItemView({model: model})
            view._eventInput.pipe(this.scrollview)
            this.views.push(view)
        }, this)
    }

    Stream.prototype.addClass = function(name) {
        this.scrollview._scroller.group.addClass(name)
    }

    Stream.prototype._onSync = function() {
        this.loading = false
        this.scrollview.infiniteScrollDisabled = false
        this.setContent()
    }
})
