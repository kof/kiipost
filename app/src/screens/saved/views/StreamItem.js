define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var Engine = require('famous/core/Engine')
    var View = require('famous/core/View')
    var Group = require('famous/core/Group')
    var Surface = require('famous/core/Surface')
    var FlexibleLayout = require('famous/views/FlexibleLayout')

    var Pool = require('components/stream/helpers/Pool')
    var elementsMap = require('components/elements-map/elementsMap')

    var app = require('app')

    var tpl = require('../templates/stream-item.html')

    var pool = new Pool()

    pool.setCreator(function() {
        var container = document.createElement('div')
        container.innerHTML = tpl
        var map = elementsMap(container)
        map.container = container
        return map
    })

    function StreamItem() {
        View.apply(this, arguments)

        var width = app.context.getSize()[0]

        this.model = this.options.model
        this.options.size = [width, width * app.GOLDEN_RATIO]
        this._imageWidth = Math.round(this.options.size[1] * app.GOLDEN_RATIO)
        this._poolItem = pool.get()

        this.surface = new Surface({
            size: this.options.size,
            classes: ['stream-item']
        })
        this.add(this.surface)
        this.surface.pipe(this)

        this.surface.on('click', this._onClick.bind(this))
        this.surface.on('recall', this._onRecall.bind(this))
        this.surface.on('deploy',this._onDeploy.bind(this))
    }

    inherits(StreamItem, View)
    module.exports = StreamItem

    StreamItem.DEFAULT_OPTIONS = {
        model: null
    }

    StreamItem.prototype.setContent = function() {
        var attr = this.model.attributes
        var i = this._poolItem
        var textWidth

        if (attr.image) {
            textWidth = this.options.size[0] - this._imageWidth + 'px'
            app.imagesLoader.load(attr.image.url, function(err, image) {
                if (err) return

                i.image.style.backgroundImage = 'url(' + attr.image.url + ')'
                i.image.style.width = this._imageWidth + 'px'
                i.image.style.backgroundSize = attr.image.icon ? 'contain' : 'cover'
                if (image.width <= this._imageWidth && image.height <= this.options.size[1]) {
                    i.image.style.backgroundSize = 'initial'
                }
                i.image.style.display = 'block'
            }.bind(this))
        } else {
            textWidth = '100%'
        }

        i.text.style.width = textWidth
        i.title.textContent = attr.title
        i.summary.textContent = attr.summary
        i.link.href = attr.link
        i.link.textContent = attr.hostname
        i.image.style.display = 'none'

        this.surface.setContent(i.container)
    }

    StreamItem.prototype._onClick = function(e) {
        if (e.target.classList.contains('source')) return
        e.preventDefault()
        app.context.emit('article:open', this.model)
    }

    StreamItem.prototype._onRecall = function() {
        pool.release(this._poolItem)
    }

    StreamItem.prototype._onDeploy = function() {
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
