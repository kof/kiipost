define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Transform = require('famous/core/Transform')
    var Modifier = require('famous/core/Modifier')
    var Surface = require('famous/core/Surface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')

    var app = require('app')
    var constants = require('constants')

    function Article() {
        View.apply(this, arguments)
        var width = app.context.getSize()[0]
        this.model = this.options.model
        this.options.size = [width, Math.round(width * constants.BRULE_RATIO)]
        this.scrollviewController = this.options.stream.scrollviewController
        this.initialize()
        this.setContent()
    }

    inherits(Article, View)
    module.exports = Article

    Article.EVENTS = {
        open: true
    }

    Article.DEFAULT_OPTIONS = {
        model: null,
        scrollview: null,
        title: {height: 0.39},
        summary: {height: 0.43}
    }

    Article.prototype.initialize = function() {
        var o = this.options
        var height = o.size[1]
        var imageWidth = this._imageWidth = this.model.getImage() ? Math.round(height * constants.GOLDEN_RATIO) : 0
        var textWidth = o.size[0] - imageWidth

        this.container = new ContainerSurface({
            size: o.size,
            classes: ['article']
        })
        this.add(this.container)
        this.container.on('click', this._onClick.bind(this))
        this.container.on('deploy', this._onDeploy.bind(this))
        this.container.on('recall', this._onRecall.bind(this))

        var titleHeight = height * o.title.height
        this._title = new Surface({
            classes: ['title'],
            size: [textWidth, titleHeight]
        })
        this.container.add(this._title)

        var summaryHeight = height * o.summary.height
        this._summary = new Surface({
            classes: ['summary'],
            size: [textWidth, summaryHeight]
        })
        this.container
            .add(new Modifier({
                transform: Transform.translate(0, titleHeight)
            }))
            .add(this._summary)

        this._link = new Surface({
            classes: ['truncate', 'link'],
            size: [textWidth, true]
        })
        this.container
            .add(new Modifier({
                transform: Transform.translate(0, titleHeight + summaryHeight)
            }))
            .add(this._link)

        this._image = new Surface({
            classes: ['image'],
            size: [imageWidth, height]
        })
        this.container
            .add(new Modifier({
                transform: Transform.translate(textWidth, 0)
            }))
            .add(this._image)

        this.scrollviewController.on('scrollEnd', this._onScrollEnd.bind(this))
    }

    Article.prototype.setContent = function() {
        var a = this.model.attributes
        this._title.setContent(a.title)
        this._summary.setContent(a.summary)
        this._link.setContent(a.hostname)
    }

    Article.prototype._setImage = function() {
        if (this._imageSet) return

        var image = this.model.getImage()

        if (!image) return

        function setImage(err, size) {
            if (err) return

            var backgroundSize = image.isIcon ? 'contain' : 'cover'

            if (size.width <= this._imageWidth && size.height <= this.options.size[1]) {
                backgroundSize = 'initial'
            }

            // Set the size on image object to avoid preloading by the next render.
            image.width = size.width
            image.height = size.height

            this._image.setProperties({
                backgroundImage: 'url(' + image.url + ')',
                backgroundSize: backgroundSize
            })
        }

        if (image.width && image.height) {
            setImage.call(this, null, image)
        } else {
            app.imagesLoader.load(image.url, setImage.bind(this))
        }

        this._imageSet = true
    }

    Article.prototype._onScrollEnd = function() {
        if (this._deployed) this._setImage()
    }

    Article.prototype._onDeploy = function() {
        this._deployed = true
        if (!this.scrollviewController.scrolling) this._setImage()
    }

    Article.prototype._onRecall = function() {
        this._deployed = false
    }

    Article.prototype._onClick = _.debounce(function() {
        if (this.scrollviewController.scrolling) return
        this._eventOutput.emit('open', this.model)
    }, 500, true)
})
