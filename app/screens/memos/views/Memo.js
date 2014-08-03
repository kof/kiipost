define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var moment = require('moment')

    var Engine = require('famous/core/Engine')
    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')

    var Pool = require('app/components/stream/helpers/Pool')
    var elementsMap = require('app/components/elements-map/elementsMap')

    var app = require('app')
    var constants = require('app/constants')

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
        var height = Math.round(width * constants.BRULE_RATIO)

        this.model = this.options.model
        this.models = this.options.models
        this.options.size = [width, height]
        this._imageWidth = Math.round((height - (height * this.options.memoHeight)) * constants.GOLDEN_RATIO)
        this.scrollviewController = this.options.stream.scrollviewController

        this._poolItem = pool.get()
        this.container = new Surface({
            size: this.options.size,
            classes: ['memo']
        })
        this.add(this.container)
        this.container.pipe(this._eventOutput)

        this.container.on('click', this._onClick.bind(this))
        this.container.on('recall', this._onRecall.bind(this))
        this.container.on('deploy',this._onDeploy.bind(this))

        this.scrollviewController.on('scrollEnd', this._onScrollEnd.bind(this))
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
        var image = attr.articles[0] ? attr.articles[0].getImage() : null

        if (image) {
            if (!this._textOffsetLeft) this._textOffsetLeft = i.content.offsetLeft
            textWidth = this.options.size[0] - this._textOffsetLeft - this._imageWidth + 'px'
            i.image.style.display = 'block'
        } else {
            i.image.className = 'dummy'
            i.image.style.display = 'none'
            textWidth = '100%'
        }

        i.sourceIcon.textContent = attr.tweetId ? 'twitter' : 'star'
        i.date.textContent = moment(attr.createdAt).fromNow()
        i.text.textContent = attr.text || ''
        i.content.style.width = textWidth
        i.title.textContent = article.title || ''
        i.summary.textContent = article.summary || ''
        i.link.href = article.url || ''
        i.link.textContent = article.hostname || ''

        this.container.setContent(i.container)
        Engine.nextTick(this._setVisible.bind(this))
        if (!this.scrollviewController.isScrolling && image) this._setImages()
    }

    MemoItem.prototype._setImages = function() {
        if (this._imagesSet) return
        var attr = this.model.attributes
        var image = attr.articles[0] ? attr.articles[0].getImage() : null
        var i = this._poolItem

        i.avatar.style.backgroundImage = 'url(' + this.models.user.get('imageUrl') + ')'

        if (!image) return

        function setImage(err, size) {
            if (err) return
            i.image.style.backgroundImage = 'url(' + image.url + ')'
            i.image.style.width = this._imageWidth + 'px'
            var backgroundSize = image.isIcon ? 'contain' : 'cover'
            if (size.width <= this._imageWidth && size.height <= this.options.size[1]) {
                backgroundSize = 'initial'
            }

            // Set the size on image object to avoid preloading by the next render.
            image.width = size.width
            image.height = size.height

            i.image.style.backgroundSize = backgroundSize
        }

        if (image.width && image.height) {
            setImage.call(this, null, image)
        } else {
            app.imagesLoader.load(image.url, setImage.bind(this))
        }

        this._imagesSet = true
    }

    MemoItem.prototype._setVisible = function() {
        this._poolItem.container.style.visibility = 'visible'
    }

    MemoItem.prototype._onClick = _.debounce(function() {
        if (this.scrollviewController.isScrolling) return
        this._eventOutput.emit('open', this.model)
    }, 500, true)

    MemoItem.prototype._onScrollEnd = function() {
        if (this._deployed) this._setImages()
    }

    MemoItem.prototype._onRecall = function() {
        this._deployed = false
        pool.release(this._poolItem)
    }

    MemoItem.prototype._onDeploy = function() {
        this._deployed = true
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
