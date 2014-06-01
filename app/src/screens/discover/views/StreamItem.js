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
        var width = app.context.getSize()[0]
        this.options.size = [width, width * app.GOLDEN_RATIO]
        this._imageWidth = Math.round(this.options.size[1] * app.GOLDEN_RATIO)

        this.surface = new Surface({
            size: this.options.size,
            classes: ['stream-item']
        })
        this.add(this.surface)
        this.surface.pipe(this)
        this.setContent()
        this.surface.on('click', this._onClick.bind(this))
    }

    inherits(StreamItem, View)
    module.exports = StreamItem

    StreamItem.DEFAULT_OPTIONS = {
        model: null
    }

    StreamItem.prototype.setContent = function() {
        var data = this.model.toJSON()

        function set() {
            this.surface.setContent(tpl.render(data))
        }

        if (data.image) {
            data.image.width = this._imageWidth
            data.width = this.options.size[0] - this._imageWidth
            app.imagesLoader.load(data.image.url, function(err, image) {
                if (err)  {
                    delete data.image
                } else {
                    if (image.width <= this._imageWidth && image.height <= this.options.size[1]) {
                        data.image.small = true
                    }
                }
                set.call(this)
            }.bind(this))
        } else {
            set.call(this)
        }
    }

    StreamItem.prototype._onClick = function(e) {
        if (e.target.classList.contains('source')) return
        e.preventDefault()
        app.context.emit('article:open', this.model)
    }
})
