'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')

var FullArticleView = require('./FullArticle')
var MemoEditView = require('app/components/memo-edit/views/MemoEdit')
var Overlay = require('app/components/overlay/Overlay')

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
        darkOutTransition: {duration: 200}
    },
    kiipostButton: {
        size: [60, 60],
        origin: [0.5, 0.96]
    },
    z: 2
}

NewFullArticle.prototype.initialize = function() {
    var o = this.options
    this.articleView = new FullArticleView(o)
    this.articleView.container.addClass('new-full-article')
    this.container = this.articleView.container
    this.spinner = this.articleView.spinner
    this.articleView.pipe(this._eventOutput)
    this.add(this.articleView)

    this.kiipostBtn = new Surface({
        content: 'twitter',
        classes: ['icomatic', 'kiipost-btn'],
        size: o.kiipostButton.size
    })
    this.kiipostBtn.on('click', this._onMemoEditOpen.bind(this))
    this.container.add(new Modifier({
        origin: o.kiipostButton.origin,
        transform: Transform.translate(0, 0, o.z + 2)
    })).add(this.kiipostBtn)

    this.overlay = new Overlay({z: o.z + 3})
    this.add(this.overlay)

    this.memoEdit = new MemoEditView({
        context: app.context,
        models: this.models
    })
    this.memoEdit
        .on('hide', this._onMemoEditHide.bind(this))
        .on('saved', this._onMemoEditSaved.bind(this))
    this.add(new Modifier({
        transform: Transform.translate(0, 0, o.z + 4)
    })).add(this.memoEdit)

    var height = app.context.getSize()[1]
    var buttonHeight = this.kiipostBtn.getSize()[1]
    var buttonPadding = height - height * o.kiipostButton.origin[1]
    this.articleView.addItem(new Surface({
        classes: ['placeholder'],
        size: [undefined, buttonPadding * 2 + buttonHeight],
        properties: {background: '#fff'}
    }))

    this._optionsManager.on('change', this._onOptionsChange.bind(this))
}

NewFullArticle.prototype.setContent = function() {
    this.articleView.relatedArticles.collection.options.relatedToArticle = this.model.id
    this.articleView.relatedMemos.collection.options.relatedToArticle = this.model.id
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

NewFullArticle.prototype.closeMemoEdit = function() {
    if (!this._memoEditOpened) return
    this.articleView.bg.resume()
    this.memoEdit.hide({silent: true})
    this._memoEditOpened = false
}

NewFullArticle.prototype._onMemoEditOpen = _.debounce(function(e) {
    this.articleView.bg.pause()
    this.overlay.show()
    this.memoEdit.show()
    this._memoEditOpened = true
}, 500, true)

NewFullArticle.prototype._onMemoEditHide = function() {
    this.overlay.hide()
    this.closeMemoEdit(this.options.memoEdit.darkOutTransition)
}

NewFullArticle.prototype._onMemoEditSaved = function() {
    app.context.emit('fullArticle:kiiposted', this.model)
}

NewFullArticle.prototype._onOptionsChange = function(option) {
    if (option.id == 'models') {
        this.models = option.value
    } else if (option.id == 'model') {
        this.model = option.value
        this.memoEdit.options.models.article = this.model
    }

    this.articleView.setOption(option.id, option.value)
}
