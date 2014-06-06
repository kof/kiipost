define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var RenderController = require('famous/views/RenderController')
    var FlexibleLayout = require('famous/views/FlexibleLayout')
    var SequentialLayout = require('famous/views/SequentialLayout')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var FormContainerSurface = require('famous/surfaces/FormContainerSurface')
    var SubmitInputSurface = require('famous/surfaces/SubmitInputSurface')
    var TextareaSurface = require('famous/surfaces/TextareaSurface')

    var SpinnerView = require('components/spinner/views/Spinner')

    var app = require('app')

    function Kiipost() {
        RenderController.apply(this, arguments)

        var size = app.context.getSize()

        this.container = new ContainerSurface({
            classes: ['kiipost']
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
            content: 'Abort',
            classes: ['abort'],
            size: [true, undefined]
        })
        this.abort.on('click', this.hide.bind(this))
        this.actionBar.add(this.abort)

        this.counter = new Surface({
            classes: ['counter'],
            content: this.options.limit,
            size: [true, true]
        })
        this.actionBar.add(this.counter)

        this.submit = new Surface({
            content: 'Kiipost',
            classes: ['submit'],
            size: [true, undefined]
        })
        this.submit.on('click', this._onSubmit.bind(this))
        this.actionBar.add(this.submit)


        this.memo = new FormContainerSurface({
            classes: ['memo'],
            size: [undefined, 130]
        })
        this.layoutSequence.push(this.memo)

        this.memoLayout = new FlexibleLayout({
            ratios: [.2, .8]
        })
        this.memoSurfaces = []
        this.memoLayout.sequenceFrom(this.memoSurfaces)
        this.memo.add(this.memoLayout)

        this.avatar = new Surface({
            classes: ['avatar'],
            content: '<span/>'
        })
        this.memoSurfaces.push(this.avatar)

        this.textarea = new TextareaSurface({
            placeholder: 'Your memo.',
            size: [true, undefined]
        })
        this.textarea.on('keydown', this._onType.bind(this))
        this.memoSurfaces.push(this.textarea)
    }

    inherits(Kiipost, RenderController)
    module.exports = Kiipost

    Kiipost.DEFAULT_OPTIONS = {
        limit: 130
    }

    Kiipost.prototype.show = function() {
        Kiipost.super_.prototype.show.call(this, this.container, function() {
            setTimeout(function() {
                this.textarea.focus()
            }.bind(this), 10)
        }.bind(this))
    }

    Kiipost.prototype.hide = function() {
        Kiipost.super_.prototype.hide.call(this, this.container)
        this._eventOutput.emit('hide')
    }

    Kiipost.prototype._onType = _.throttle(function(e) {
        var remaining = this.options.limit - this.textarea.getValue().length

        this.limitViolation = remaining < 0
        if (this.limitViolation) {
            this.counter.addClass('error')
        } else {
            this.counter.removeClass('error')
        }
        this.counter.setContent(remaining)
    }, 100, {leading: false})

    Kiipost.prototype._onSubmit = function() {
        alert('submit')
    }
})
