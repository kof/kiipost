'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Group = require('famous/core/Group')
var Transform = require('famous/core/Transform')
var Modifier = require('famous/core/Modifier')

var ScrollviewController = require('app/components/famous/ScrollviewController')
var InfiniteScrollView  = require('app/components/famous/InfiniteScrollview')
var SpinnerRenderer  = require('app/components/spinner/views/Renderer')
var SpinnerContainerView  = require('app/components/spinner/views/Container')

/**
 * Infinite list.
 *
 * @param {Object} options overrides Stream.defaults
 * @api public
 */
function Stream() {
    View.apply(this, arguments)

    this.models = this.options.models
    this.views = this.options.views
    this.collection = this.options.collection
    this._initialViewsAmount = this.views.length
    this._initialViewsHeight = 0
    this.views.forEach(function(view) {
        this._initialViewsHeight += view.getSize()[1]
    }, this)
    this._loading = false
    this._endReached = false
    this.initialize()
}

inherits(Stream, View)
module.exports = Stream

Stream.EVENTS = {
    loadStart: true,
    loadEnd: true,
    scrollEnd: true
}

Stream.DEFAULT_OPTIONS = {
    ItemView: null,
    views: [],
    classes: null,
    scrollview: {
        // Margin for full scroller to render invisible items
        // before they get shown.
        // Don't render more then can be displayed.
        margin: 0,
        // Makes the scrolling animation stop faster.
        friction: 0.003,
        direction: 1
    },
    back: {
        classes: ['back'],
        properties: {backgroundColor: '#fff'}
    }
}

Stream.prototype.initialize = function() {
    var o = this.options
    var size = o.context.getSize()

    this.stream = new Group({classes: o.classes})
    this.add(this.stream)

    // Trigger infiniteScroll event 5 screens before items actually get rendered.
    o.scrollview.offset = size[o.scrollview.direction] * 10
    this.scrollview = new InfiniteScrollView(o.scrollview)
    this.scrollviewController = new ScrollviewController(this.scrollview)
    this.stream.add(new Modifier({
        transform: Transform.inFront
    })).add(this.scrollview)
    this.scrollview.sequenceFrom(this.views)
    this.scrollview.on('infiniteScroll', _.debounce(this.load.bind(this), 300, true))

    this.collection.on('end', this._onCollectionEnd.bind(this))

    if (o.back) {
        this.back = new Surface(o.back)
        this.stream.add(new Modifier({
            transform: Transform.translate(0, this._initialViewsHeight)
        })).add(this.back)
    }

    this.centralSpinner = new SpinnerRenderer()
    var spinnerY = this._initialViewsHeight + (size[1] - this._initialViewsHeight - this.centralSpinner.getSize()[1]) / 2
    this.centralSpinner.container.containerModifier.transformFrom(Transform.translate(0, spinnerY, 2))
    this.centralSpinner.container.containerModifier.originFrom([0.5, 0])
    this.centralSpinner.container.spinner.addClass('green')

    this.add(this.centralSpinner)

    this.edgeSpinner = new SpinnerContainerView({
        containerSize: [size[0], 64]
    })
    this.edgeSpinner.spinner.addClass('green')
}

Stream.prototype.load = function(options, callback) {
    if (!options) options = {}
    if (!options.reset && (this._loading || this._endReached)) return

    this._loading = true
    this.scrollview.infiniteScrollDisabled = true

    if (options.reset) {
        this.views.splice(this._initialViewsAmount)
        this.collection.reset()
        this.scrollviewController.goToFirst(undefined, 0)
    } else {
        // Minus views added before scroll items.
        this.collection.options.skip = this.views.length - this._initialViewsAmount
    }

    if (this.views.length > this._initialViewsAmount) this.views.push(this.edgeSpinner)

    this.collection.fetch()
        .then(this.setContent.bind(this))
        .always(function() {
            this._loading = false
            this.scrollview.infiniteScrollDisabled = false
            this.centralSpinner.hide()
            var spinnerIndex = this.views.indexOf(this.edgeSpinner)
            if (spinnerIndex >= 0) this.views.splice(spinnerIndex, 1)
            if (callback) callback()
        }.bind(this))
}

Stream.prototype.setContent = function() {
    var ItemView = this.options.ItemView

    this.collection.each(function(model) {
        var view = new ItemView({
            model: model,
            models: this.models,
            stream: this
        })
        view.container.pipe(this.scrollview)
        view.pipe(this._eventOutput)
        this.views.push(view)
    }, this)
}

Stream.prototype.addClass = function(name) {
    this.scrollview._scroller.group.addClass(name)
}

Stream.prototype._onCollectionEnd = function() {
    this._endReached = true
}
