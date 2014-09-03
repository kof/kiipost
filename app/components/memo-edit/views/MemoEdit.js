'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var Surface = require('famous/core/Surface')
var RenderController = require('famous/views/RenderController')
var FlexibleLayout = require('famous/views/FlexibleLayout')
var SequentialLayout = require('famous/views/SequentialLayout')
var ContainerSurface = require('famous/surfaces/ContainerSurface')
var FormContainerSurface = require('famous/surfaces/FormContainerSurface')
var TextareaSurface = require('famous/surfaces/TextareaSurface')

var SlideDownTransition = require('app/components/animations/SlideDownTransition')
var alert = require('app/components/notification/alert')

var TweetModel = require('../models/Tweet')

var conf = require('app/conf')

function MemoEdit() {
    RenderController.apply(this, arguments)
    this.models = this.options.models
    var o = this.options
    // 1 is for space after text.
    this.limit =  o.maxLength - 1 - conf.twitter.shortUrlMaxLength - o.suffix.length
    this.initialize()
}

inherits(MemoEdit, RenderController)
module.exports = MemoEdit

MemoEdit.DEFAULT_OPTIONS = {
    suffix: ' via @kiipost',
    maxLength: 140,
    contentSize: [undefined, 180],
    actionBarSize: [undefined, 50],
    context: null,
    models: null
}

MemoEdit.prototype.initialize = function() {
    var o = this.options

    this.container = new ContainerSurface({
        classes: ['memo-edit']
    })
    this.add(this.container)

    this.back = new Surface({classes: ['back']})
    this.container.add(this.back)

    this.layoutSequence = []
    this.layout = new SequentialLayout()
    this.layout.sequenceFrom(this.layoutSequence)
    this.container.add(this.layout)

    this.memo = new FormContainerSurface({
        classes: ['memo'],
        size: [undefined, o.contentSize[1] - o.actionBarSize[1]]
    })
    this.layoutSequence.push(this.memo)

    this.memoLayout = new FlexibleLayout({
        ratios: [.2, .8]
    })
    this.memoSurfaces = []
    this.memoLayout.sequenceFrom(this.memoSurfaces)
    this.memo.add(this.memoLayout)

    this.avatarImage = document.createElement('span')
    this.avatar = new Surface({
        classes: ['avatar'],
        content: this.avatarImage
    })
    this.memoSurfaces.push(this.avatar)

    this.textarea = new TextareaSurface({})
    this.textarea.on('keydown', this._onType.bind(this))
    this.memoSurfaces.push(this.textarea)

    this.actionBar = new ContainerSurface({
        classes: ['action-bar'],
        size: o.actionBarSize
    })
    this.layoutSequence.push(this.actionBar)

    this.abort = new Surface({
        content: 'cancel',
        classes: ['abort'],
        size: [true, undefined]
    })
    this.abort.on('click', this._onHide.bind(this))
    this.actionBar.add(this.abort)

    this.counter = new Surface({
        classes: ['counter'],
        content: this.limit,
        size: [true, true]
    })
    this.actionBar.add(this.counter)

    this.submit = new Surface({
        content: '<span>tweet</span>',
        classes: ['submit'],
        size: [true, undefined]
    })
    this.submit.on('click', this._onSave.bind(this))
    this.actionBar.add(this.submit)

    new SlideDownTransition({size: o.contentSize}).commit(this)
}

MemoEdit.prototype.show = function() {
    MemoEdit.super_.prototype.show.call(this, this.container, function() {
        this.textarea.focus()
    }.bind(this))
}

MemoEdit.prototype.hide = function(options) {
    if (!options) options = {}
    MemoEdit.super_.prototype.hide.call(this)
    if (!options.silent) this._eventOutput.emit('hide')
}

MemoEdit.prototype.setAvatarUrl = function(url) {
    this.avatarImage.style.backgroundImage = 'url(' + url + ')'
}

MemoEdit.prototype._onType = _.throttle(function() {
    var remaining = this.limit - this.textarea.getValue().length

    this.limitViolation = remaining < 0
    if (this.limitViolation) {
        this.counter.addClass('error')
    } else {
        this.counter.removeClass('error')
    }
    this.counter.setContent(remaining)
}, 100, {leading: false})

MemoEdit.prototype._onHide = _.debounce(function() {
    this.hide()
}, 500, true)

MemoEdit.prototype._onSave = _.debounce(function() {
    var text = this.textarea.getValue()
    if (this.limitViolation || this._saving || !text) return
    this._saving = true

    var model = new TweetModel()

    model.set('text', text + ' ' + this.models.article.get('url') + this.options.suffix)

    model.save()
        .then(function() {
            this._eventOutput.emit('saved')
            this.hide()
        }.bind(this))
        .fail(function(xhr) {
            alert(xhr.responseText)
        })
        .always(function() {
            this._saving = false
        }.bind(this))
}, 500, true)
