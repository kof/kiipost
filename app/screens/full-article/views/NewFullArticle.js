'use strict'

var inherits = require('inherits')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')

var FullArticleView = require('./FullArticle')
var MemoEditView = require('app/components/memo-edit/views/MemoEdit')

var app = require('app')
var constants = require('app/constants')

function NewFullArticle(options) {
    View.apply(this, arguments)
    this.models = options.models
    this.initialize()
}

inherits(NewFullArticle, View)
module.exports = NewFullArticle

NewFullArticle.DEFAULT_OPTIONS = {
    models: null,
    memoEdit: {
        darkInTransition: {duration: 200},
        darkOutTransition: {duration: 200},
    },
    kiipostButton: {
        size: [60, 60],
        origin: [0.5, 0.96]
    }
}

NewFullArticle.prototype.initialize = function() {
    this.articleView = new FullArticleView(this.options)
    this.articleView.container.addClass('new-full-article')
    this.container = this.articleView.container
    this.containerModifier = this.articleView.containerModifier
    this.spinner = this.articleView.spinner
    this.articleView.pipe(this._eventOutput)
    this.add(this.articleView)

    this.kiipostBtn = new Surface({
        classes: ['kiipost-btn'],
        size: this.options.kiipostButton.size
    })
    this.kiipostBtn.on('click', this._onMemoEditOpen.bind(this))
    this.container.add(new Modifier({
        origin: this.options.kiipostButton.origin,
        transform: Transform.translate(0, 0, 1)
    })).add(this.kiipostBtn)

    this.memoEdit = new MemoEditView({
        context: app.context,
        model: this.models.memo
    })
    this.memoEdit
        .on('hide', this._onMemoEditHide.bind(this))
        .on('saved', this._onMemoEditSaved.bind(this))
    this.add(this.memoEdit)

    var height = app.context.getSize()[1]
    var buttonHeight = this.kiipostBtn.getSize()[1]
    var buttonPadding = height - height * this.options.kiipostButton.origin[1]
    this.articleView.addItem(new Surface({
        classes: ['placeholder'],
        size: [undefined, buttonPadding * 2 + buttonHeight],
        properties: {background: '#fff'}
    }))

    this._optionsManager.on('change', this._onOptionsChange.bind(this))
}

NewFullArticle.prototype.setContent = function() {
    this.articleView.setContent()
    var avatarUrl = this.models.user.get('imageUrl')
    if (avatarUrl) this.memoEdit.setAvatarUrl(avatarUrl)
}

NewFullArticle.prototype.setPreviewContent = function() {
    this.articleView.setPreviewContent.apply(this.articleView, arguments)
}

NewFullArticle.prototype.cleanup = function() {
    this.articleView.cleanup.apply(this.articleView, arguments)
}

NewFullArticle.prototype.closeMemoEdit = function(options) {
    if (!this._memoEditOpened) return
    this.articleView.bg.resume()
    this.containerModifier.setOpacity(1, options || {duration: 0})
    this.memoEdit.hide({silent: true})
    this._memoEditOpened = false
}

NewFullArticle.prototype._onMemoEditOpen = function(e) {
    this.articleView.bg.pause()
    this.containerModifier.setOpacity(0.3, this.options.memoEdit.darkInTransition)
    this.memoEdit.show()
    this._memoEditOpened = true
}

NewFullArticle.prototype._onMemoEditHide = function() {
    this.closeMemoEdit(this.options.memoEdit.darkOutTransition)
}

NewFullArticle.prototype._onMemoEditSaved = function() {
    app.context.emit('fullArticle:kiiposted', this.model)
}

NewFullArticle.prototype._onOptionsChange = function(option) {
    if (option.id == 'models') {
        this.models = option.value
        this.memoEdit.model = this.models.memo
    } else if (option.id == 'model') {
        this.model = option.value
    }

    this.articleView.setOption(option.id, option.value)
}
