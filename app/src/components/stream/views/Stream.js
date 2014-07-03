define(function(require, exports, module) {
    'use strict'

    var $ = require('jquery')
    var mustache = require('mustache')
    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var InfiniteScrollView  = require('famous-infinitescroll')
    var Group = require('famous/core/Group')
    var Transform = require('famous/core/Transform')
    var Modifier = require('famous/core/Modifier')

    var app = require('app')

    /**
     * Infinite list.
     *
     * @param {Object} options overrides Stream.defaults
     * @api public
     */
    function Stream() {
        View.apply(this, arguments)

        var contextHeight = app.context.getSize()[1]

        this.models = this.options.models
        this.views = this.options.views
        this.collection = this.options.collection
        this._initialViewsAmount = this.views.length
        this._loading = false
        this._endReached = false

        this.stream = new Group({classes: this.options.classes})
        this.add(new Modifier({transform: Transform.inFront})).add(this.stream)

        this.scrollview = new InfiniteScrollView({
            // Trigger infiniteScroll event 5 screens before items actually get rendered.
            offset: contextHeight * 5,
            // Margin for full scroller to render invisible items
            // before they get shown.
            margin: contextHeight * 2
        })
        this.stream.add(this.scrollview)
        this.scrollview.sequenceFrom(this.views)
        this.scrollview.on('infiniteScroll', _.debounce(this.load.bind(this), 300, true))
        this.collection.on('end', this._onEnd.bind(this))
        this.back = new Surface({
            classes: ['back'],
            properties: {backgroundColor: '#fff'}
        })
        this.stream.add(new Modifier({
            transform: Transform.multiply(
                Transform.behind,
                Transform.translate(0, this.options.backTop)
            )
        })).add(this.back)
    }

    inherits(Stream, View)
    module.exports = Stream

    Stream.DEFAULT_OPTIONS = {
        ItemView: null,
        views: null,
        classes: null,
        backTop: null
    }

    Stream.prototype.load = function(options) {
        if (!options) options = {}
        if (this._loading || this._endReached) return
        this._eventOutput.emit('stream:loadstart')
        this._loading = true
        this.scrollview.infiniteScrollDisabled = true
        if (options.reset) {
            this.views.splice(this._initialViewsAmount, this.views.length)
            this.collection.options.skip = 0
        } else {
            // Minus views added before scroll items.
            this.collection.options.skip = this.views.length - this._initialViewsAmount
        }
        this.collection.fetch()
            .then(this.setContent.bind(this))
            .always(function() {
                this._loading = false
                this.scrollview.infiniteScrollDisabled = false
                this._eventOutput.emit('stream:loadend')
            }.bind(this))
    }

    Stream.prototype.setContent = function() {
        var ItemView = this.options.ItemView

        this.collection.each(function(model) {
            var view = new ItemView({model: model, models: this.models})
            view.pipe(this.scrollview).pipe(this._eventOutput)
            this.views.push(view)
        }, this)
    }

    Stream.prototype.addClass = function(name) {
        this.scrollview._scroller.group.addClass(name)
    }

    Stream.prototype._onEnd = function() {
        this._endReached = true
    }
})
