'use strict'

var inherits = require('inherits')
var _ = require('underscore')
var _s = require('underscore.string')
var moment = require('moment')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var ContainerSurface = require('famous/surfaces/ContainerSurface')
var Modifier = require('famous/core/Modifier')
var Group = require('famous/core/Group')
var Transform = require('famous/core/Transform')
var Scrollview = require('famous/views/Scrollview')

var ParallaxedBackgroundView = require('app/components/parallaxed-background/ParallaxedBackground')
var SpinnerView = require('app/components/spinner/views/Renderer')

var RelatedArticles = require('./RelatedArticles')

var app = require('app')
var constants = require('app/constants')

function FullArticle() {
    View.apply(this, arguments)
    this._size = app.context.getSize()
    this.surfaces = []
    this.collections = this.options.collections
    this.initialize()
}

inherits(FullArticle, View)
module.exports = FullArticle

FullArticle.DEFAULT_OPTIONS = {
    model: null,
    padding: 16,
    link: {height: 40},
    date: {width: 40}
}

FullArticle.prototype.initialize = function() {
    var o = this.options
    this.container = new Group({classes: ['full-article']})
    this.containerModifier = new Modifier()
    this.add(this.containerModifier).add(this.container)

    this.scrollview = new Scrollview()
    this.container.add(this.scrollview)
    this.scrollview.sequenceFrom(this.surfaces)

    this.bg = new ParallaxedBackgroundView({
        context: app.context,
        overlay: true
    })
    this.container.add(this.bg)

    this._headerSize = [this._size[0], this._size[0] * constants.BRULE_RATIO]
    this.header = new ContainerSurface({
        classes: ['header'],
        size: this._headerSize
    })
    this.addItem(this.header)

    this.close = new Surface({
        classes: ['icomatic', 'close'],
        content: 'arrowleft',
        size: [true, true]
    })
    this.close.on('click', this._onClose.bind(this))
    this.header.add(this.close)

    this.original = new Surface({
        classes: ['icomatic', 'original'],
        content: 'externallink',
        size: [true, true]
    })
    this.original.on('click', this._onOpenOriginal.bind(this))
    this.header.add(this.original)

    this.title = new Surface({
        classes: ['title'],
        size: [undefined, true]
    })
    this.header.add(this.title)

    this.body = new ContainerSurface({
        classes: ['body'],
        properties: {
            padding: o.padding + 'px'
        }
    })
    this.addItem(this.body)

    var linkWidth =  this._size[0] - o.date.width - o.padding * 2
    this.link = new Surface({
        classes: ['truncate', 'link'],
        size: [linkWidth, o.link.height]
    })
    this.link.on('click', this._onOpenOriginal.bind(this))
    this.body.add(this.link)

    this.date = new Surface({
        classes: ['date'],
        size: [o.date.width, o.link.height]
    })
    this.body
        .add(new Modifier({
            transform: Transform.translate(linkWidth, 0)
        }))
        .add(this.date)

    this.text = new Surface({
        size: [undefined, true],
        classes: ['text']
    })
    this.body.add(new Modifier({
        transform: Transform.translate(0, o.link.height)
    })).add(this.text)
    this._minBodyHeight = this._size[1] - this._headerSize[1] + o.padding * 2

    this.relatedArticles = new RelatedArticles()
    this.relatedArticles.container.pipe(this.scrollview)
    this.addItem(this.relatedArticles)

    this.spinner = new SpinnerView({spinner: {
        containerTransform: Transform.translate(0, this._headerSize[1], 1),
        containerSize: [this._size[0], this._minBodyHeight],
        hasBox: false
    }})
    this.spinner.container.container.setProperties({backgroundColor: '#fff'})
    this.spinner.container.spinner.addClass('green')
    this.add(this.spinner)

    this._optionsManager.on('change', this._onOptionsChange.bind(this))
}

FullArticle.prototype.setContent = function() {
    this.title.setContent(this.model.get('title'))
    // TODO fix design issues and use html.
    var descr = this.model.get('description') || ''
    descr = descr.replace(/<\/p>/g, '___br___')
    descr = _s.stripTags(descr)
    descr = descr.replace(/___br___/g, '<br /><br />')
    this.text.setContent(descr)
    this._setImage(this.model)
    this.bg.resume()
    this.link.setContent(this.model.get('hostname'))
    // We don't have a pubDate when article comes from twitter.
    var date = this.model.get('pubDate')
    if (date) this.date.setContent(moment(date).locale('en-short').fromNow(true))
    setTimeout(this._setBodySize.bind(this), 500)
    this.relatedArticles.stream.load({reset: true})
}

/**
 * Content to be rendered before transition starts.
 */
FullArticle.prototype.setPreviewContent = function(model, callback) {
    this.title.setContent(model.get('title'))
    this.bg.resume()
    this._setImage(model, callback)
}

FullArticle.prototype.cleanup = function() {
    this.title.setContent('')
    this.text.setContent('')
    this.text.setSize([undefined, true])
    this._resetImage()
    this.bg.setContent()
}

FullArticle.prototype.addItem = function(renderable) {
    renderable.pipe(this.scrollview)
    this.surfaces.push(renderable)
}

FullArticle.prototype.setOption = function(key, value) {
    this._optionsManager.set(key, value)
}

FullArticle.prototype._resetImage = function() {
    this.bg.setProperties({
        backgroundSize: 'contain',
        backgroundPosition: 'center top'
    })
}

FullArticle.prototype._setImage = function(model, callback) {
    var image = model.getImage()

    if (this._currImage === image) return setTimeout(callback)

    this._resetImage()

    if (!image) return setTimeout(callback)

    function setImage(err, size) {
        if (err) return setTimeout(callback, 0, err)
        var props = {}
        props.backgroundSize = image.isIcon ? 'contain' : 'cover'

        if (size.width <= this._headerSize[0] && size.height <= this._headerSize[1]) {
            var top = (this._headerSize[1] + this.bg.options.offset * 2 - size.height) / 2
            props.backgroundSize = 'initial'
            props.backgroundPosition = 'center ' + top + 'px'
        }

        this.bg.setProperties(props)
        this.bg.setContent(image.url)
        setTimeout(callback)
    }

    if (image.width && image.height) setImage.call(this, null, image)
    else app.imagesLoader.load(image.url, setImage.bind(this))
}

FullArticle.prototype._setBodySize = function() {
    var height = this.text.getSize(true)[1] + this.options.link.height + this.options.padding * 2
    if (height < this._minBodyHeight) height = this._minBodyHeight
    this.body.setSize([undefined, height])
}

FullArticle.prototype._open = function(url) {
    window.open(url, '_blank', [
        'location=yes',
        'enableViewportScale=yes',
        'allowInlineMediaPlayback=yes',
        'transitionstyle=fliphorizontal'
    ].join(','))
}

FullArticle.prototype._onOptionsChange = function(option) {
    if (option.id == 'model') {
        this.model = option.value
    }
}

FullArticle.prototype._onClose = _.debounce(function() {
    this._eventOutput.emit('close')
}, 500, true)

FullArticle.prototype._onOpenOriginal = _.debounce(function() {
    this._open(this.model.get('url'))
}, 500, true)
