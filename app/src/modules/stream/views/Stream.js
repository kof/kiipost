define(function(require, exports, module) {
'use strict'

var $ = require('jquery')
var Backbone = require('backbone')
var mustache = require('mustache')
var inherits = require('inherits')
var _ = require('underscore')
var IScroll = require('iscroll/iscroll-infinite')
var ImagesLoder = require('images-loader')

var dataset = require('modules/dataset/index')
var elementsMap = require('modules/jquery-elements-map/jquery.ElementsMap')

var streamTpl = mustache.compile(require('../templates/stream.html'))

/**
 * Stream constructor.
 *
 * @param {Object} options overrides Stream.defaults
 * @api public
 */
function Stream(options) {
    this.name = 'stream'
    this.options = _.extend({}, Stream.defaults, options)
    this.events = {
        'beforehide.ipanel': '_onBeforeHide',
        'show.ipanel': '_onShow',
        'tap .js-tag': '_onAddTag',
        'tapdown .js-open': '_onOpenExternal',
        'tapdown .js-preview': '_onPreview'
    }
    this.needsReset = false
    this._endReached = false
    this._isEmpty = null
    this._scrolling = false
    this._view = null
    this._imageRendererMap = {}
    this._imagesLoader = new ImagesLoder
    this._imageContainerSize = null
    Backbone.View.apply(this, arguments)
}

/**
 * Default options.
 *
 * @type {Object}
 * @api public
 */
Stream.defaults = {
    itemsAmount: 10,
    maxTagsAmount: 10,
    mouseWheelSpeed: 10,
    toolbarIcons: {
        external: true,
        info: true
    },
    toolbar: true,
    // Will be used in .render
    data: null,
    showTips: false,
    explain: ['tags', 'relevance']
}

inherits(Stream, Backbone.View)
module.exports = Stream

/**
 * Initialize view.
 *
 * @api public
 */
Stream.prototype.initialize = function() {
    this.listenTo(this.collection, 'sync', this._onSync)
}

/**
 * Render view.
 *
 * @param {Object} options
 * @return {Stream} this
 * @api public
 */
Stream.prototype.render = function(options) {
    var o = _.extend({}, this.options, options),
        items = []

    _.times(o.itemsAmount, function() {
        var item = o.data ? _.clone(o.data) : {}
        item.tags = []
        item.tags.length = o.maxTagsAmount
        item.nodeId = _.uniqueId()
        items.push(item)
        // Produce debounced version of image renderer for every image node.
        this._imageRendererMap[item.nodeId] = _.debounce(this._renderImage.bind(this), 300)
    }, this)

    this.el.innerHTML = streamTpl.render({items: items})
    this.elements.list = this.$('.js-list')
    this.elements.scroller = this.$('.js-scroller')
    this.elements.nothingFound = this.$('.js-nothing-found')
    this.elements.listItems = this.$('.js-list-item')
    this.elements.itemToolbar = $(itemToolbarTpl.render(o.toolbarIcons))

    return this
}

/**
 * Show view.
 *
 * @return {Stream} this
 * @api public
 */
Stream.prototype.show = function() {
    Backbone.View.prototype.show.apply(this, arguments)
    this._renderList()

    return this
}

/**
 * Reset view.
 *
 * @param {Object} options
 * @return {Stream} this
 * @api public
 */
Stream.prototype.reset = function(options) {
    var colOpts = this.collection.options

    if (!this.needsReset) return this

    this.needsReset = false

    options = _.extend({
        reset: true,
        skip: 0
    }, options)
    this._endReached = false
    this._isEmpty = null
    _.extend(colOpts, options)
    this.collection.reset()
    this._iScroll.infiniteCache = undefined
    this._iScroll.scrollTo(0, 0, 0)
    this._setLimit(5000)
    this._changeRange(0, colOpts.range)
    if (this._view != colOpts.view) {
        this.$el.removeClass(this._view + '-view').addClass(colOpts.view + '-view')
        this._view = colOpts.view
        this._iScroll.refresh({resize: true})
    }

    return this
}

/**
 * Setup view.
 *
 * @param {Object} options
 * @return {Stream} this
 * @api public
 */
Stream.prototype.setup = function(options) {
    var opts

    options || (options = {})
    opts = _.extend(this.options, options)

    this.needsReset = this.needsReset || opts.reset || !this.collection.length ||
        opts.catId != this.collection.options.catId

    if (opts.catId) this.collection.options.catId = opts.catId

    return opts
}

/**
 * Update list item.
 *
 * @param {Element} el
 * @param {Backbone.Model} model
 * @return {Stream} this
 * @api private
 */
Stream.prototype._updateListItem = function(el, model) {
    var o = this.options,
        elemsMap = $(el).elementsMap('get'),
        data, source,
        tagData, tagElem,
        i, nodeId

    // Save original class names to switch fast later.
    if (!this._itemClass) {
        this._itemClass = elemsMap.item[0].className
        this._tagClass = elemsMap.tag[0].className
        this._imageClass = elemsMap.image[0].className
        this._sourceClass = elemsMap.source[0].className
    }

    if (model) {
        data = model.attributes
        elemsMap.item[0].id = data._id
        elemsMap.item[0].className = this._itemClass
        elemsMap.relevanceValue[0].style.height = data.relevance + '%'
        // Using innerHTML because of html entities you want to preserve.
        // Downside - its not secure.
        elemsMap.title[0].innerHTML = data.title
        elemsMap.date[0].textContent = data.relativeDate
        source = data.retweeter ? data.retweeter.name : (data.host || '')
        elemsMap['source-name'][0].textContent = source
        elemsMap.source[0].className = this._sourceClass + (source ? ' has-source' : '')
        elemsMap.summary[0].innerHTML = data.summary || ''
        if (this.collection.options.view == 'gallery') {
            // Always hide previous image for the case there is no/bad new one.
            elemsMap.image[0].style.backgroundImage = 'none'

            if (data.image) {
                nodeId = dataset(elemsMap.item[0], 'nodeId')
                this._imageRendererMap[nodeId](elemsMap.image[0], data.image, data.title)
            }
        }
        for (i = 0; i < o.maxTagsAmount; i++) {
            tagData = data.tags[i]
            tagElem = elemsMap.tag[i]
            if (tagData) {
                tagElem.textContent = '#' + tagData.name
                tagElem.style.backgroundColor = tagData.color
                dataset(tagElem, 'itemId', data._id)
                tagElem.className = this._tagClass
                if (!tagData.added) tagElem.className += ' add'
            } else {
                tagElem.className = this._tagClass + ' hidden'
            }
        }
    // Scrolled too fast.
    } else if (!this._endReached && this.loading()) {
        this._iScroll.disable()
        elemsMap.item[0].className = this._itemClass + ' hidden'
    }

    return this
}

/**
 * Render preview image.
 *
 * @param {Element} elem
 * @param {Object} image
 * @param {String} title
 * @return {Stream} this
 * @api private
 */
Stream.prototype._renderImage = function(elem, image, title) {
    var size = this._imageContainerSize

    if (!size) {
        size = this._imageContainerSize = {
            height: elem.offsetHeight,
            width: elem.offsetWidth
        }
    }

    this._imagesLoader.load(image.url, function(err, data) {
        if (err) return
        elem.style.backgroundImage = 'url("' + image.url + '")'
        elem.className = this._imageClass + (image.icon ? ' icon' : '')

        // Image is not bigger than container, don't scale it.
        if (data.width <= size.width && data.height <= size.height) {
            elem.className += ' small'
        }
    }.bind(this))

    return this
}

/**
 * Render list view. Should be done first in visible dom.
 *
 * @return {Stream} this
 * @api private
 */
Stream.prototype._renderList = function() {
    if (this._iScroll) return this

    this._iScroll = new IScroll(this.$('.js-scroller')[0], {
        infiniteElements: this.elements.listItems,
        dataset: this._changeRange.bind(this),
        dataFiller: this._updateListItem.bind(this),
        cacheSize: this.collection.options.range,
        mouseWheelSpeed: this.options.mouseWheelSpeed
    });

    this._iScroll.on('scrollStart', this._onScrollStart.bind(this))
    this._iScroll.on('scrollEnd', this._onScrollEnd.bind(this))

    return this
}

/**
 * Set limit.
 *
 * @return {Stream} this
 * @api private
 */
Stream.prototype._setLimit = function(limit) {
    this._iScroll.options.infiniteLimit = limit
    this._iScroll.refresh()

    return this
}

/**
 * Check if list is empty and apply classes.
 *
 * @return {Stream} this
 * @api private
 */
Stream.prototype._isEmptyCheck = function() {
    if (this._isEmpty != null) return this
    this._isEmpty = !this.collection.length
    this.elements.nothingFound.toggleClass('hidden', !this._isEmpty)
    this.elements.scroller.toggleClass('invisible', this._isEmpty)

    return this
}

/**
 * Trigger different data rendering.
 *
 * @param {Number} start offset
 * @param {Number} amount of items
 * @return {Stream} this
 * @api private
 */
Stream.prototype._changeRange = function(start, amount) {
    if (this.loading()) return this
    this.loading(true)
    this.collection.getRange(start, amount, function(models) {
        this._iScroll.updateCache(start, models)
        if (models.length < amount) {
            this._endReached = true
            this._setLimit(this.collection.length)
        }
        this._iScroll.enable()
        this.loading(false)
        this._isEmptyCheck()
        setTimeout(this.showTip.bind(this), 1000)
    }.bind(this))

    return this
}

/**
 * Select item.
 *
 * @param {Element} el
 * @param {Backbone.Model} model
 * @return {Stream} this
 * @api private
 */
Stream.prototype._select = function(el, model) {
    // Toolbar is already shown, second click leads to opening the preview.
    if (this.model === model) return this.trigger('open', model)
    this.model = model
    if (this.elements.selected) this.elements.selected.removeClass('selected')
    this.elements.selected = $(el).addClass('selected')
    if (this.options.toolbar) this.elements.itemToolbar.appendTo(el)

    return this
}

/**
 * Set option, set reset flag.
 *
 * @param {String} name
 * @param {Mixed} value
 * @return {Stream} this
 * @api private
 */
Stream.prototype._setOption = function(name, value) {
    this.collection.options[name] = value
    this.needsReset = true

    return this
}

/**
 * Do everything needed on scroll start.
 *
 * @api private
 */
Stream.prototype._onScrollStart = function() {
    if (this.elements.selected) this.elements.selected.removeClass('selected')
    this.model = null
    this._scrolling = true
}

/**
 * Do everything needed on scroll end.
 *
 * @api private
 */
Stream.prototype._onScrollEnd = function() {
    this._scrolling = false
    this.showTip()
}

/**
 * On collection sync.
 *
 * @api private
 */
Stream.prototype._onSync = function() {
    this.loading(false)
    if (this._iScroll) this._iScroll.enable()
}

/**
 * On tags collection change.
 *
 * @api private
 */
Stream.prototype._onTagsChange = function() {
    this.needsReset = true
}

/**
 * On sort change.
 *
 * @api private
 */
Stream.prototype._onSortChange = function(settings, sort, options) {
    this._setOption('sort', sort)
}

/**
 * On since date change.
 *
 * @api private
 */
Stream.prototype._onSinceChange = function(settings, since, options) {
    this._setOption('since', since)
}

/**
 * On view type change.
 *
 * @api private
 */
Stream.prototype._onViewChange = function(settings, view, options) {
    this._setOption('view', view)
}


/**
 * Open post in new window.
 *
 * @param {Event} e
 * @api private
 */
Stream.prototype._onOpenExternal = function(e) {
    e.preventDefault()
    e.stopPropagation()
    window.open(this.model.get('link'), 'updeoBlogpost')
}

/**
 * Open post preview.
 *
 * @param {Event} e
 * @api private
 */
Stream.prototype._onPreview = function(e) {
    e.preventDefault()
    e.stopPropagation()
    this.trigger('open', this.model)
}


})
