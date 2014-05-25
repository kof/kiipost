define(function(require, exports, module) {
'use strict'

var $ = require('jquery')
var mustache = require('mustache')
var inherits = require('inherits')
var _ = require('underscore')
var ImagesLoder = require('images-loader')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var InfiniteScrollView  = require('famous-infinitescroll')
var context = require('context')

var streamTpl = mustache.compile(require('../templates/stream.html'))

// XXX
var rss = require('../mocks/rss.json')
rss.forEach(function(data, i) {
    data.title = i + ' ' + data.title
})

/**
 * Stream constructor.
 * Implements iscroll as a famous view.
 *
 * @param {Object} options overrides Stream.defaults
 * @api public
 */
function Stream() {
    View.apply(this, arguments)
    var contextHeight = context.getSize()[1]

    this.scrollview = new InfiniteScrollView({
        // Trigger infiniteScroll event 5 screens before items actually get rendered.
        offset: contextHeight * 5,
        // Height of the full scroller, factor 2 to render invisible items
        // before they get shown.
        margin: contextHeight * 2
    })

    var header = this.options.header
    this.collection = this.options.collection
    this.views = [header]
    header._eventInput.pipe(this.scrollview)
    this.scrollview.sequenceFrom(this.views)
    this.lastRenderedIndex = 0
    this.scrollview.on('infiniteScroll', this.load.bind(this))
    this.scrollview._eventInput.pipe(this)
    this.scrollview._eventInput.pipe(header._eventOutput)
    this.add(this.scrollview)
    this.load()
}

inherits(Stream, View)
module.exports = Stream

Stream.DEFAULT_OPTIONS = {
    itemsAmount: 30,
    ItemView: null,
    collection: []
}

Stream.prototype.load = function() {
    if (this.loading) return
    this.loading = true
    this.scrollview.infiniteScrollDisabled = true
    setTimeout(function() {
        var len = this.views.length
        this.collection = rss.slice(len, len + this.options.itemsAmount)
        this.scrollview.infiniteScrollDisabled = false
        this.loading = false
        this.setContent()
    }.bind(this), 500)
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

})
