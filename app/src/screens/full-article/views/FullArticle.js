define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var Group = require('famous/core/Group')
    var Scrollview = require('famous/views/Scrollview')

    var ParallaxedBackgroundView = require('components/parallaxed-background/ParallaxedBackground')
    var SpinnerView = require('components/spinner/views/Spinner')

    var MemoEditView = require('components/memo-edit/views/MemoEdit')

    var app = require('app')
    var constants = require('constants')

    function FullArticle() {
        View.apply(this, arguments)

        this._size = app.context.getSize()
        this._textSize = [undefined, undefined]

        this.surfaces = []

        this.models = this.options.models

        this.content = new Group({classes: ['content']})
        this.contentModifier = new Modifier()
        this.add(this.contentModifier).add(this.content)

        this.scrollview = new Scrollview()
        this.content.add(this.scrollview)
        this.scrollview.sequenceFrom(this.surfaces)

        this.bg = new ParallaxedBackgroundView({context: app.context})
        this.bg.pause()
        this.content.add(this.bg)

        this.topBtns = new Surface({
            content: '<span class="close icomatic">close</span>' +
                '<span class="source icomatic">externallink</span>',
            classes: ['full-article-top-btns'],
            size: [this._size[0], true]
        })
        this.topBtns.on('click', this._onTopBtnClick.bind(this))
        this.surfaces.push(this.topBtns)

        this.title = document.createElement('h1')
        this._headerSize = [this._size[0], this._size[0] * constants.GOLDEN_RATIO]
        this.header = new Surface({
            content: this.title,
            classes: ['full-article-header'],
            size: this._headerSize
        })
        this.header.pipe(this.scrollview)
        this.surfaces.push(this.header)

        this.textContent = document.createElement('div')
        this.textContent.className = 'content'
        this.text = new Surface({
            content: this.textContent,
            size: [this._size[0], this._size[1] - this._headerSize[1]],
            classes: ['full-article-text']
        })

        this.text.pipe(this.scrollview)
        this.textContent.addEventListener('click', this._onTextClick.bind(this))
        this.surfaces.push(this.text)

        this.spinner = new SpinnerView()
        this.add(this.spinner)

        this.kiipostBtn = new Surface({
            classes: ['full-article-kiipost-btn'],
            size: [true, true]
        })
        this.kiipostBtn.on('click', this._onKiipost.bind(this))
        this.add(new Modifier({origin: [0.5, 0.97]})).add(this.kiipostBtn)

        this.memoEdit = new MemoEditView({
            context: app.context,
            model: this.models.memo
        })
        this.memoEdit.on('hide', this._onKiipostHide.bind(this))
        this.add(this.memoEdit)

        this._optionsManager.on('change', this._onOptionsChange.bind(this))
        this._toggleKiipostBtn(this.options.hasKiipostBtn, true)

        this.content.on('recall', this._onRecall.bind(this))
    }

    inherits(FullArticle, View)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {
        models: null,
        hasKiipostBtn: true,
        darkInTransition: {duration: 200},
        darkOutTransition: {duration: 200},
    }

    FullArticle.prototype.setContent = function() {
        this.title.textContent = this.model.get('title')
        this.textContent.innerHTML = this.model.get('description')
        this._setImage()
        this.bg.resume()
        // We need to check periodicaly the height because of images in the content.
        this._textHeightIntervalId = setInterval(this._setTextHeight.bind(this), 500)
    }

    FullArticle.prototype.cleanup = function() {
        this.title.textContent = ''
        this.textContent.textContent = ''
        this._resetImage()
        this.bg.setContent()
    }

    FullArticle.prototype._resetImage = function() {
        this.bg.setProperties({
            backgroundSize: 'contain',
            backgroundPosition: 'center top'
        })
    }

    FullArticle.prototype._setImage = function() {
        var attr = this.model.attributes
        var imageUrl, isIcon

        this._resetImage()

        if (attr.images.length) {
            imageUrl = attr.images[0]
        } else if (attr.icon) {
            isIcon = true
            imageUrl = attr.icon
        }
        if (!imageUrl) return

        app.imagesLoader.load(imageUrl, function(err, data) {
            if (err) return

            var size = this._headerSize
            var props = {}

            props.backgroundSize = isIcon ? 'contain' : 'cover'

            if (data.width <= size[0] && data.height <= size[1]) {
                var top = (size[1] + this.bg.options.offset * 2 - data.height) / 2
                props.backgroundSize = 'initial'
                props.backgroundPosition = 'center ' + top + 'px'
            }

            this.bg.setProperties(props)
            this.bg.setContent(imageUrl)
        }.bind(this))
    }

    FullArticle.prototype._setTextHeight = function() {
        var textHeight = this.textContent.offsetHeight
        var headerHeight = this._headerSize[1]
        var contextHeight = this._size[1]

        if (textHeight + headerHeight < contextHeight) {
            textHeight = contextHeight - headerHeight
        }

        if (this._textSize[1] != textHeight) {
            this._textSize[1] = textHeight
            this.text.setSize(this._textSize)
        }
    }

    FullArticle.prototype._toggleKiipostBtn = function(show, force) {
        if (!force && !this.options.hasKiipostBtn) return
        this.kiipostBtn.setProperties({display: show ? 'block' : 'none'})
    }

    FullArticle.prototype._onRecall = function() {
        clearInterval(this._textHeightIntervalId)
    }

    FullArticle.prototype._onKiipost = function(e) {
        this.bg.pause()
        this.contentModifier.setOpacity(0.3, this.options.darkInTransition)
        this._toggleKiipostBtn(false)
        this.memoEdit.show()
    }

    FullArticle.prototype._onKiipostHide = function() {
        this.bg.resume()
        this.contentModifier.setOpacity(1, this.options.darkOutTransition)
        this._toggleKiipostBtn(true)
    }

    FullArticle.prototype._onTopBtnClick = function(e) {
        var cls = e.target.classList
        if (cls.contains('close')) {
            this._eventOutput.emit('close')
        } else if (cls.contains('source')) {
            window.open(this.model.get('url'), '_blank', [
                'location=yes',
                'enableViewportScale=yes',
                'allowInlineMediaPlayback=yes',
                'transitionstyle=fliphorizontal'
            ].join(','))
        }
    }

    FullArticle.prototype._onOptionsChange = function(option) {
        if (option.id == 'hasKiipostBtn') {
            this._toggleKiipostBtn(option.value, true)
        } else if (option.id == 'models') {
            this.models = option.value
            this.memoEdit.model = this.models.memo
        }
    }

    FullArticle.prototype._onTextClick = function(e) {
        // Prevent links from opening!
        e.preventDefault()
    }
})
