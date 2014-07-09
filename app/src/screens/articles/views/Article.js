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
    var constants = require('constants')

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

    function Article() {
        View.apply(this, arguments)

        var width = app.context.getSize()[0]

        this.model = this.options.model
        this.options.size = [width, Math.round(width * constants.BRULE_RATIO)]
        this._imageWidth = Math.round(this.options.size[1] * constants.GOLDEN_RATIO)
        this._poolItem = pool.get()

        this.surface = new Surface({
            size: this.options.size,
            classes: ['article']
        })
        this.add(this.surface)

        this.surface.on('click', this._onClick.bind(this))
        this.surface.on('recall', this._onRecall.bind(this))
        this.surface.on('deploy',this._onDeploy.bind(this))
    }

    inherits(Article, View)
    module.exports = Article

    Article.EVENTS = {
        open: true
    }

    Article.DEFAULT_OPTIONS = {
        model: null
    }

    Article.prototype.setContent = function() {
        var attr = this.model.attributes
        var i = this._poolItem
        var textWidth
        var image = this.model.getImage()

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
            textWidth = this.options.size[0] - this._imageWidth + 'px'
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

        i.text.style.width = textWidth
        i.title.textContent = attr.title
        i.summary.textContent = attr.summary
        i.link.href = attr.url
        i.link.textContent = attr.hostname

        this.surface.setContent(i.container)
    }

    Article.prototype._onClick = function(e) {
        e.preventDefault()
        this._eventOutput.emit('open', this.model)
    }

    Article.prototype._onRecall = function() {
        pool.release(this._poolItem)
    }

    Article.prototype._onDeploy = function() {
        // Without nextTick changes will not applied.
        Engine.nextTick(this.setContent.bind(this))
    }
})
