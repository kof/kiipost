define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var Engine = require('famous/core/Engine')
    var View = require('famous/core/View')
    var Group = require('famous/core/Group')
    var Surface = require('famous/core/Surface')
    var FlexibleLayout = require('famous/views/FlexibleLayout')

    var Pool = require('components/stream/helpers/Pool')
    var elementsMap = require('components/elements-map/elementsMap')

    var app = require('app')

    var tpl = require('../templates/memo.html')

    var pool = new Pool()

    pool.setCreator(function() {
        var container = document.createElement('div')
        container.className = 'inner'
        container.innerHTML = tpl
        var map = elementsMap(container)
        map.container = container
        return map
    })

    function MemoItem() {
        View.apply(this, arguments)

        var width = app.context.getSize()[0]
        var height = width * app.GOLDEN_RATIO

        this.model = this.options.model
        this.models = this.options.models
        this.options.size = [width, height]
        this._imageWidth = Math.round((height - (height * this.options.memoHeight)) * app.GOLDEN_RATIO)
        this._poolItem = pool.get()
        this.surface = new Surface({
            size: this.options.size,
            classes: ['memo']
        })
        this.add(this.surface)
        this.surface.pipe(this)

        this.surface.on('click', this._onClick.bind(this))
        this.surface.on('recall', this._onRecall.bind(this))
        this.surface.on('deploy',this._onDeploy.bind(this))
    }

    inherits(MemoItem, View)
    module.exports = MemoItem

    MemoItem.DEFAULT_OPTIONS = {
        model: null,
        memoHeight: 0.35
    }

    MemoItem.prototype.setContent = function() {
        var attr = this.model.attributes
        var article = attr.articles[0] ? attr.articles[0].attributes : {}
        var i = this._poolItem
        var textWidth

        var imageUrl, icon
        if (article.images && article.images[0]) {
            imageUrl = article.images[0]
        } else {
            imageUrl = article.icon
            icon = true
        }
        if (imageUrl) {
            if (!this._textOffsetLeft) this._textOffsetLeft = i.content.offsetLeft
            textWidth = this.options.size[0] - this._imageWidth - this._textOffsetLeft + 'px'
            app.imagesLoader.load(imageUrl, function(err, image) {
                if (err) return

                i.image.style.backgroundImage = 'url(' + imageUrl + ')'
                i.image.style.width = this._imageWidth + 'px'
                i.image.style.backgroundSize = icon ? 'contain' : 'cover'
                if (image.width <= this._imageWidth && image.height <= this.options.size[1]) {
                    i.image.style.backgroundSize = 'initial'
                }
                i.image.style.display = 'block'
            }.bind(this))
        } else {
            textWidth = '100%'
        }

        i.avatar.style.backgroundImage = 'url(' + this.models.user.get('imageUrl') + ')'
        i.text.textContent = attr.text
        i.content.style.width = textWidth
        i.title.textContent = article.title || ''
        i.summary.textContent = article.summary || ''
        i.link.href = article.url || ''
        i.link.textContent = article.hostname || ''
        i.image.style.display = 'none'

        this.surface.setContent(i.container)
    }

    MemoItem.prototype._onClick = function(e) {
        if (e.target.classList.contains('source')) return
        e.preventDefault()
    }

    MemoItem.prototype._onRecall = function() {
        pool.release(this._poolItem)
    }

    MemoItem.prototype._onDeploy = function() {
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
