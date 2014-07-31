define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var Scrollview = require('famous/views/Scrollview')

    var AutoSizedSurface = require('components/famous/AutoSizedSurface')

    var termsText = require('../templates/terms.html')

    function Terms() {
        View.apply(this, arguments)
        this.initialize()
    }

    inherits(Terms, View)
    module.exports = Terms

    Terms.prototype.initialize = function() {
        this.container = new ContainerSurface({
            classes: ['terms']
        })
        this.add(this.container)

        this.header = new Surface({
            content: '<span class="close icomatic">arrowleft</span>',
            classes: ['header'],
            size: [undefined, true]
        })
        this.header.on('click', this._onClose.bind(this))
        this.container.add(new Modifier({
            transform: Transform.inFront,
            opacity: 0.8
        })).add(this.header)

        this.contents = []

        var scrollview = new Scrollview()
        this.container.add(scrollview)
        scrollview.sequenceFrom(this.contents)

        this.content = new AutoSizedSurface({
            content: termsText,
            size: [undefined, true],
            classes: ['content']
        })
        this.content.pipe(scrollview)

        this.contents.push(this.content)
    }

    Terms.prototype._onClose = function() {
        this._eventOutput.emit('close')
    }
})
