define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var Engine = require('famous/core/Engine')
    var Surface = require('famous/core/Surface')
    var RenderController = require('famous/views/RenderController')
    var FlexibleLayout = require('famous/views/FlexibleLayout')
    var SequentialLayout = require('famous/views/SequentialLayout')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var FormContainerSurface = require('famous/surfaces/FormContainerSurface')
    var TextareaSurface = require('famous/surfaces/TextareaSurface')

    var SlideDownTransition = require('components/animations/SlideDownTransition')

    function MemoEdit() {
        RenderController.apply(this, arguments)

        var o = this.options
        var size = o.context.getSize()

        this.model = o.model
        this.models = o.models

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

        this.actionBar = new ContainerSurface({
            classes: ['action-bar'],
            size: [undefined, 50]
        })
        this.layoutSequence.push(this.actionBar)

        this.abort = new Surface({
            content: 'cancel',
            classes: ['abort'],
            size: [true, undefined]
        })
        this.abort.on('click', this.hide.bind(this))
        this.actionBar.add(this.abort)

        this.counter = new Surface({
            classes: ['counter'],
            content: o.limit,
            size: [true, true]
        })
        this.actionBar.add(this.counter)

        this.submit = new Surface({
            content: '<span>kiipost</span>',
            classes: ['submit'],
            size: [true, undefined]
        })
        this.submit.on('click', this._onSave.bind(this))
        this.actionBar.add(this.submit)

        this.memo = new FormContainerSurface({
            classes: ['memo'],
            size: [undefined, o.contentSize[1] - this.actionBar.getSize()[1]]
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

        this.textarea = new TextareaSurface({
            placeholder: 'What did you learn from that link?',
            size: [undefined, undefined]
        })
        this.textarea.on('keydown', this._onType.bind(this))
        this.memoSurfaces.push(this.textarea)

        new SlideDownTransition({size: o.contentSize}).commit(this)

    }

    inherits(MemoEdit, RenderController)
    module.exports = MemoEdit

    MemoEdit.DEFAULT_OPTIONS = {
        limit: 130,
        contentSize: [undefined, 180],
        context: null,
        model: null
    }

    MemoEdit.prototype.show = function() {
        MemoEdit.super_.prototype.show.call(this, this.container, function() {
            this.textarea.focus()
        }.bind(this))
    }

    MemoEdit.prototype.hide = function() {
        MemoEdit.super_.prototype.hide.call(this)
        this._eventOutput.emit('hide')
    }

    MemoEdit.prototype.setAvatarUrl = function(url) {
        this.avatarImage.style.backgroundImage = 'url(' + url + ')'
    }

    MemoEdit.prototype._onType = _.throttle(function(e) {
        var remaining = this.options.limit - this.textarea.getValue().length

        this.limitViolation = remaining < 0
        if (this.limitViolation) {
            this.counter.addClass('error')
        } else {
            this.counter.removeClass('error')
        }
        this.counter.setContent(remaining)
    }, 100, {leading: false})

    MemoEdit.prototype._onSave = function() {
        if (this.limitViolation || this._saving) return
        this._saving = true
        this.model.set('text', this.textarea.getValue())
        this.model.save()
            .then(function() {
                this._eventOutput.emit('saved')
                this.hide()
            }.bind(this))
            .always(function() {
                this._saving = false
            }.bind(this))
    }
})
