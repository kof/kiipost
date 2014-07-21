define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
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

        this.article = new Group({classes: ['full-article']})
        this.articleModifier = new Modifier()
        this.add(this.articleModifier).add(this.article)

        this.scrollview = new Scrollview()
        this.article.add(this.scrollview)
        this.scrollview.sequenceFrom(this.surfaces)

        this.bg = new ParallaxedBackgroundView({context: app.context})
        this.bg.pause()
        this.article.add(this.bg)

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

        this.textContent = document.createElement('div')
        this.textContent.className = 'content'
        this.text = new Surface({
            content: this.textContent,
            size: [this._size[0], this._size[1] - this._headerSize[1]],
            classes: ['text']
        })

        this.text.pipe(this.scrollview)
        this.textContent.addEventListener('click', this._onTextClick.bind(this))
        this.surfaces.push(this.text)

        this.spinner = new SpinnerView({origin: [0.5, 0.7]})
        this.add(this.spinner)

        this.kiipostBtn = new Surface({
            classes: ['kiipost-btn'],
            size: [true, true]
        })
        this.kiipostBtn.on('click', this._onKiipostOpen.bind(this))
        this.article.add(new Modifier({origin: [0.5, 0.96]})).add(this.kiipostBtn)

        this.memoEdit = new MemoEditView({
            context: app.context,
            model: this.models.memo
        })
        this.memoEdit
            .on('hide', this._onKiipostHide.bind(this))
            .on('saved', this._onKiipostSaved.bind(this))
        this.add(this.memoEdit)

        this._optionsManager.on('change', this._onOptionsChange.bind(this))
        this._toggleKiipostBtn(this.options.hasKiipostBtn, true)

        this.article.on('recall', this._onRecall.bind(this))
    }

    inherits(FullArticle, View)
    module.exports = FullArticle

    FullArticle.DEFAULT_OPTIONS = {
        models: null,
        hasKiipostBtn: true,
        darkInTransition: {duration: 200},
        darkOutTransition: {duration: 200}
    }

    FullArticle.prototype.setContent = function() {
        this.title.textContent = this.model.get('title')
        this.textContent.innerHTML = this._getLink() + this.model.get('description')
        this._setImage(this.model)
        this.bg.resume()
        var avatarUrl = this.models.user.get('imageUrl')
        if (avatarUrl) this.memoEdit.setAvatarUrl(avatarUrl)
        // We need to check periodicaly the height because of images in the content.
        this._textHeightIntervalId = setInterval(this._setTextHeight.bind(this), 500)
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
        this.textContent.textContent = ''
        this._resetImage()
        this.bg.setContent()
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

    FullArticle.prototype._setTextHeight = function() {
        var textHeight = this.textContent.offsetHeight
        var headerHeight = this._headerSize[1]
        var contextHeight = this._size[1]

        if (textHeight + headerHeight < contextHeight) textHeight = contextHeight - headerHeight

        if (this._textSize[1] != textHeight) {
            this._textSize[1] = textHeight
            this.text.setSize(this._textSize)
        }
    }

    FullArticle.prototype._toggleKiipostBtn = function(show, force) {
        if (!force && !this.options.hasKiipostBtn) return
        this.kiipostBtn.setProperties({display: show ? 'block' : 'none'})
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
        clearInterval(this._textHeightIntervalId)
    }

    FullArticle.prototype._onKiipostOpen = function(e) {
        this.bg.pause()
        this.articleModifier.setOpacity(0.3, this.options.darkInTransition)
        this._toggleKiipostBtn(false)
        this.memoEdit.show()
    }

    FullArticle.prototype._onKiipostHide = function() {
        this.bg.resume()
        this.articleModifier.setOpacity(1, this.options.darkOutTransition)
        this._toggleKiipostBtn(true)
    }

    FullArticle.prototype._onKiipostSaved = function() {
        app.context.emit('fullArticle:kiiposted', this.model)
    }

    FullArticle.prototype._onTopBtnClick = function(e) {
        var cls = e.target.classList
        if (cls.contains('close')) this._eventOutput.emit('close')
    }

    FullArticle.prototype._onOptionsChange = function(option) {
        if (option.id == 'hasKiipostBtn') this._toggleKiipostBtn(option.value, true)
        else if (option.id == 'models') {
            this.models = option.value
            this.memoEdit.model = this.models.memo
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
})
