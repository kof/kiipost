define(function(require, exports, module) {
'use strict'

var $ = require('jquery')
var mustache = require('mustache')
var inherits = require('inherits')
var _ = require('underscore')
var ImagesLoder = require('images-loader')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var InfiniteScrollView  = require('famous-infinitescroll');

var streamTpl = mustache.compile(require('../templates/stream.html'))

/**
 * Stream constructor.
 * Implements iscroll as a famous view.
 *
 * @param {Object} options overrides Stream.defaults
 * @api public
 */
function Stream(options) {
    View.apply(this, arguments)

    this.scrollview = new InfiniteScrollView({
        offset: 1000,
        margin: 1000
    })
    this.scrollview._scroller.group.setClasses(['stream'])
    this.scrollview._scroller.group.setProperties({top: this.options.headerHeight + 'px'})
    //console.log(this.scrollview._scroller.group)
//    console.log(this.scrollview._eventInput)
    this.scrollview._eventInput.on('update', function(data) {
        //this._eventInput.emit('update', data)
        //this.scrollview.setPosition(0)
       //console.log(this.scrollview)
    }.bind(this))
    //this.scrollview.infiniteScrollDisabled = true;
    this.surfaces = []
    this.scrollview.sequenceFrom(this.surfaces)
    this.scrollview.on('infiniteScroll', this.setContent.bind(this))
    this.scrollview._eventInput.pipe(this)
    this.setContent()
    this.add(this.scrollview)
}

inherits(Stream, View)
module.exports = Stream

Stream.DEFAULT_OPTIONS = {
    itemsAmount: 10
}

Stream.prototype.setContent = function(data) {
    var i, surface

    for (i = 0; i < this.options.itemsAmount; i++) {
        surface = new Surface({
            content: "Surface: " + this.surfaces.length,
            size: [undefined, 100],
            classes: ['stream-item'],
            properties: {
                backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                lineHeight: "100px",
                textAlign: "center"
            }
        })

        surface.pipe(this.scrollview)
        this.surfaces.push(surface)
    }
}


})
