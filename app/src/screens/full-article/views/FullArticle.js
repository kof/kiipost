define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var Scrollview = require('famous/views/Scrollview')

    var BackgroundView = require('components/background/Background')
    var SpinnerView = require('components/spinner/views/Spinner')
    var KiipostView = require('./Kiipost')
    var Article = require('components/article/models/Article')

    var app = require('app')

    function FullArticle() {
        View.apply(this, arguments)

        var size = app.context.getSize()

        this.surfaces = []

        this.scrollview = new Scrollview()
        this.add(this.scrollview)
        this.scrollview.sequenceFrom(this.surfaces)

        this.image = new BackgroundView()
        this.add(this.image)

        this.topBtns = new Surface({
            content: '<span class="close icomatic">close</span>' +
                '<span class="source icomatic">externallink</span>',
            classes: ['full-article-top-btns'],
            size: [size[0], true]
        })
        this.topBtns.on('click', this._onTopBtnClick.bind(this))
        this.surfaces.push(this.topBtns)

        this.title = document.createElement('h1')
        this.head = new Surface({
            content: this.title,
            classes: ['full-article-head'],
            size: [size[0], size[0] * app.GOLDEN_RATIO]
        })
        this.head.pipe(this.scrollview)
        this.surfaces.push(this.head)

        this.textContent = document.createElement('div')
        this.text = new Surface({
            content: this.textContent,
            size: [size[0], true]
        })
        this.text.pipe(this.scrollview)
        this.surfaces.push(this.text)

        this.spinner = new SpinnerView()
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.spinner)

        this.kiipostBtn = new Surface({
            classes: ['full-article-kiipost-btn'],
            size: [true, true]
        })
        this.kiipostBtn.on('click', this._onKiipost.bind(this))
        this.add(new Modifier({origin: [0.5, 0.97]})).add(this.kiipostBtn)

        this.kiipost = new KiipostView()
        this.kiipost.on('hide', this._onKiipostHide.bind(this))
        this.add(this.kiipost)
    }

    inherits(FullArticle, View)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {}

    FullArticle.prototype.load = function(id) {
        this.model = new Article({_id: id})
        this.spinner.show(true)
        this.model.fetch()
            .then(this.setContent.bind(this))
            .always(this.spinner.hide.bind(this.spinner))
    }

    FullArticle.prototype.setContent = function() {
        this.title.textContent = this.model.get('title')
        // Set class now to avoid white screen artifact during loading.
        this.text.setClasses(['full-article-text'])
        this.textContent.innerHTML = this.model.get('description')
        this._setImage()
        // Wait until text is rendered.
        setTimeout(this._setTextSize.bind(this), 50)
    }

    FullArticle.prototype._setImage = function() {
        this.image.setProperties({
            backgroundImage: null,
            backgroundSize: 'contain',
            backgroundPosition: 'center top'
        })

        var attr = this.model.attributes
        var imageUrl, isIcon

        if (attr.images.length) {
            imageUrl = attr.images[0]
        } else if (attr.icon) {
            isIcon = true
            imageUrl = attr.icon
        }
        if (!imageUrl) return

        app.imagesLoader.load(imageUrl, function(err, data) {
            if (err) return

            var size = this.head.getSize()
            var props = {}

            props.backgroundSize = isIcon ? 'contain' : 'cover'

            if (data.width <= size[0] && data.height <= size[1]) {
                var top = (size[1] + this.image.options.offset * 2 - data.height) / 2
                props.backgroundSize = 'initial'
                props.backgroundPosition = 'center ' + top + 'px'
            }

            this.image.setProperties(props)
            this.image.setContent(imageUrl)
        }.bind(this))
    }

    FullArticle.prototype._setTextSize = function() {
        var textHeight = this.textContent.parentNode.clientHeight
        var headerHeight = this.head.getSize()[1]
        var contextHeight = app.context.getSize()[1]

        if (textHeight + headerHeight < contextHeight) {
            textHeight = contextHeight - headerHeight
        }
        this.text.setSize([undefined, textHeight])
    }

    FullArticle.prototype._onKiipost = function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.kiipost.show()
    }

    FullArticle.prototype._onKiipostHide = function() {

    }

    FullArticle.prototype._onTopBtnClick = function(e) {
        var cls = e.target.classList
        if (cls.contains('close')) {
            this._eventOutput.emit('close')
        } else if (cls.contains('source')) {
            window.open(this.model.get('link'), 'article')
        }
    }
})
