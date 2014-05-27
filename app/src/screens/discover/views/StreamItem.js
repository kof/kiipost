define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var mustache = require('mustache')

    var View = require('famous/core/View')
    var Group = require('famous/core/Group')
    var Surface = require('famous/core/Surface')
    var FlexibleLayout = require('famous/views/FlexibleLayout')

    var app = require('app')

    var tpl = mustache.compile(require('../templates/stream-item.html'))

    function StreamItem() {
        View.apply(this, arguments)
        this.model = this.options.model
        this.surface = new Surface({
            size: this.options.size,
            classes: ['stream-item']
        })
        this.add(this.surface)
        this.surface.pipe(this)
        this.setContent()
    }

    inherits(StreamItem, View)
    module.exports = StreamItem

    StreamItem.DEFAULT_OPTIONS = {
        model: null,
        size: [undefined, 200],
        // In percent, if change this, change also css.
        imageWidth: 35
    }

    StreamItem.prototype.setContent = function() {
        var data = this.model.toJSON()

        function set() {
            this.surface.setContent(tpl.render(data))
        }

        if (data.image) {
            app.imagesLoader.load(data.image.url, function(err, image) {
                if (err)  {
                    delete data.image
                } else {
                    var containerWidth = Math.round(app.context.getSize()[0] * this.options.imageWidth / 100)
                    if (image.width <= containerWidth && image.height <= this.getSize()[1]) {
                        data.image.small = true
                    }
                }
                set.call(this)
            }.bind(this))
        } else {
            set.call(this)
        }
    }
})
