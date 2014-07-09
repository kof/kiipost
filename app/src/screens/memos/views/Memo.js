define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')
    var closest = require('closest')
    var moment = require('moment')

    var Engine = require('famous/core/Engine')
    var View = require('famous/core/View')
    var Group = require('famous/core/Group')
    var Surface = require('famous/core/Surface')
    var FlexibleLayout = require('famous/views/FlexibleLayout')

    var Pool = require('components/stream/helpers/Pool')
    var elementsMap = require('components/elements-map/elementsMap')

    var app = require('app')
    var constants = require('constants')

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
        this._poolItem = pool.get()
        this.surface = new Surface({
            size: this.options.size,
            classes: ['memo']
        })
        this.add(this.surface)
        this.surface.pipe(this._eventOutput)

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
        var image = attr.articles[0] ? attr.articles[0].getImage() : null

        function setImage(err, size) {
            if (err) return i.image.style.display = 'none'
            i.image.style.backgroundImage = 'url(' + image.url + ')'
            i.image.style.width = this._imageWidth + 'px'
            i.image.style.backgroundSize = image.isIcon ? 'contain' : 'cover'
            if (size.width <= this._imageWidth && size.height <= this.options.size[1]) {
                i.image.style.backgroundSize = 'initial'
            }
        }

        if (image) {
            if (!this._textOffsetLeft) this._textOffsetLeft = i.content.offsetLeft
            textWidth = this.options.size[0] - this._textOffsetLeft - this._imageWidth + 'px'
            i.image.style.display = 'block'
            if (image.width && image.height) {
                setImage.call(this, null, image)
            } else {
                app.imagesLoader.load(image.url, setImage.bind(this))
            }
        } else {
            i.image.style.display = 'none'
            textWidth = '100%'
        }

        i.avatar.style.backgroundImage = 'url(' + this.models.user.get('imageUrl') + ')'
        i.sourceIcon.textContent = attr.tweetId ? 'twitter' : 'star'
        i.date.textContent = moment(attr.createdAt).fromNow()
        i.text.textContent = attr.text || ''
        i.content.style.width = textWidth
        i.title.textContent = article.title || ''
        i.summary.textContent = article.summary || ''
        i.link.href = article.url || ''
        i.link.textContent = article.hostname || ''

        this.surface.setContent(i.container)
    }

    MemoItem.prototype._onClick = function(e) {
        e.preventDefault()
        this._eventOutput.emit('open', this.model)
    }

    MemoItem.prototype._onRecall = function() {
        pool.release(this._poolItem)
    }

    MemoItem.prototype._onDeploy = function() {
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
