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

    var tpl = require('../templates/article.html')

    var pool = new Pool()

    pool.setCreator(function() {
        var container = document.createElement('div')
        container.className = 'inner'
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
            classes: ['articles-item']
        })
        this.add(this.surface)
        this.surface.pipe(this._eventOutput)

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
        var imageUrl, isIcon

        if (attr.images.length) {
            imageUrl = attr.images[0]
        } else if (attr.icon) {
            isIcon = true
            imageUrl = attr.icon
        }

        if (imageUrl) {
            textWidth = this.options.size[0] - this._imageWidth + 'px'
            app.imagesLoader.load(imageUrl, function(err, image) {
                if (err) return

                i.image.style.backgroundImage = 'url(' + imageUrl + ')'
                i.image.style.width = this._imageWidth + 'px'
                i.image.style.backgroundSize = isIcon ? 'contain' : 'cover'
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
        i.link.href = attr.url
        i.link.textContent = attr.hostname
        i.image.style.display = 'none'

        this.surface.setContent(i.container)
    }

    StreamItem.prototype._onClick = function(e) {
        if (e.target.classList.contains('source')) return
        e.preventDefault()
        app.context.emit('discover:open', this.model)
    }

    StreamItem.prototype._onRecall = function() {
        pool.release(this._poolItem)
    }

    StreamItem.prototype._onDeploy = function() {
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
