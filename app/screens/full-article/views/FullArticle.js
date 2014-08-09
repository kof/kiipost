'use strict'

var inherits = require('inherits')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier = require('famous/core/Modifier')
var Group = require('famous/core/Group')
var Scrollview = require('famous/views/Scrollview')

var ParallaxedBackgroundView = require('app/components/parallaxed-background/ParallaxedBackground')
var SpinnerView = require('app/components/spinner/views/Spinner')

var app = require('app')
var constants = require('app/constants')

function FullArticle() {
    View.apply(this, arguments)
    this._size = app.context.getSize()
    this._textSize = [undefined, undefined]
    this.surfaces = []
    this.initialize()
}

inherits(FullArticle, View)
module.exports = FullArticle

FullArticle.DEFAULT_OPTIONS = {
    model: null
}

FullArticle.prototype.initialize = function() {
    this.container = new Group({classes: ['full-article']})
    this.containerModifier = new Modifier()
    this.add(this.containerModifier).add(this.container)

    this.scrollview = new Scrollview()
    this.container.add(this.scrollview)
    this.scrollview.sequenceFrom(this.surfaces)

    this.bg = new ParallaxedBackgroundView({context: app.context})
    this.bg.pause()
    this.container.add(this.bg)

    this.topBtns = new Surface({
        content: '<span class="close icomatic">arrowleft</span>',
        classes: ['top-btns'],
        size: [this._size[0], true]
    })
    this.topBtns.on('click', this._onTopBtnClick.bind(this))
    this.surfaces.push(this.topBtns)

    this.title = document.createElement('h1')
    this._headerSize = [this._size[0], this._size[0] * constants.BRULE_RATIO]
    this.header = new Surface({
        content: this.title,
        classes: ['header'],
        size: this._headerSize
    })
    this.header.pipe(this.scrollview)
    this.surfaces.push(this.header)

    this.text = new Surface({
        size: [undefined, true],
        classes: ['text']
    })
    this.text.pipe(this.scrollview)
    this.text.on('click', this._onTextClick.bind(this))
    this.surfaces.push(this.text)

    this.spinner = new SpinnerView({origin: [0.5, 0.7]})
    this.add(this.spinner)

    this._optionsManager.on('change', this._onOptionsChange.bind(this))
    this.container.on('recall', this._onRecall.bind(this))
}

FullArticle.prototype.setContent = function() {
    this.title.textContent = this.model.get('title')
    this.text.setContent(
        '<div class="content">' +
            this._getLink() +
            this.model.get('description') +
        '</div>'
    )
    this._setImage(this.model)
    this.bg.resume()
    setTimeout(this._setTextSize.bind(this), 200)
    // We need to check periodicaly the height because of images in the content.
    this._textSizeIntervalId = setInterval(this._setTextSize.bind(this), 1000)
}

/**
 * Content to be rendered before transition starts.
 */
FullArticle.prototype.setPreviewContent = function(model, callback) {
    this.title.textContent = model.get('title')
    this.bg.resume()
    this._setImage(model, callback)
}

FullArticle.prototype.cleanup = function() {
    this.title.textContent = ''
    this.text.setContent('')
    this._resetImage()
    this.bg.setContent()
}

FullArticle.prototype.setOption = function(key, value) {
    this._optionsManager.set(key, value)
}

FullArticle.prototype._getLink = function() {
    var a = this.model.attributes
    return '<a href="' + a.url + '" class="source">' + a.hostname + '</a>'
}

FullArticle.prototype._resetImage = function() {
    this.bg.setProperties({
        backgroundSize: 'contain',
        backgroundPosition: 'center top'
    })
}

FullArticle.prototype._setImage = function(model, callback) {
    var image = model.getImage()

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

FullArticle.prototype._setTextSize = function() {
    this.text.setSize(this.text.getSize(true))
}

FullArticle.prototype._open = function(url) {
    window.open(url, '_blank', [
        'location=yes',
        'enableViewportScale=yes',
        'allowInlineMediaPlayback=yes',
        'transitionstyle=fliphorizontal'
    ].join(','))
}

FullArticle.prototype._onRecall = function() {
    clearInterval(this._textSizeIntervalId)
}

FullArticle.prototype._onTopBtnClick = function(e) {
    var cls = e.target.classList
    if (cls.contains('close')) this._eventOutput.emit('close')
}

FullArticle.prototype._onOptionsChange = function(option) {
    if (option.id == 'model') {
        this.model = option.value
    }
}

FullArticle.prototype._onTextClick = function(e) {
    // Prevent links from opening!
    var href = e.target.href
    // Allow mailto links to open the mail program.
    if (href && href.trim().indexOf('mailto:') == 0) return
    e.preventDefault()
    if (href) this._open(href)
}
