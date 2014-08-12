'use strict'

var inherits = require('inherits')

var Modifier = require('famous/core/Modifier')
var ContainerSurface = require('famous/surfaces/ContainerSurface')
var Group = require('famous/core/Group')
var Transform = require('famous/core/Transform')
var Surface = require('famous/core/Surface')
var RenderController = require('famous/views/RenderController')

var svg = require('../images/spin.svg')

var spin = document.createElement('div')
spin.className = 'spin rotate'
spin.innerHTML = svg

function Spinner() {
    RenderController.apply(this, arguments)
    this.initialize()
}

inherits(Spinner, RenderController)
module.exports = Spinner

Spinner.DEFAULT_OPTIONS = {
    box: true,
    // Wait before showing indicator
    // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
    delay: 1000,
    size: [64, 64],
    origin: [0.5, 0.5],
    iconSize: [32, 32],
    inTransition: {duration: 0},
    outTransition: {duration: 0}
}

Spinner.prototype.initialize = function() {
    this.container = new ContainerSurface({
        classes: ['spinner']
    })

    this.boxModifier = new Modifier({
        origin: this.options.origin
    })
    this.box = new ContainerSurface({
        classes: this.options.box ? ['box'] : null,
        size: this.options.size
    })
    this.container.add(this.boxModifier).add(this.box)

    this.iconModifier = new Modifier({
        transform: Transform.translate(
            (this.options.size[0] - this.options.iconSize[0]) / 2,
            (this.options.size[1] - this.options.iconSize[1]) / 2,
            0
        )
    })
    this.icon = new Surface({
        classes: ['icon'],
        content: spin,
        size: this.options.iconSize
    })
    this.box.add(this.iconModifier).add(this.icon)
}

var show = Spinner.super_.prototype.show
Spinner.prototype.show = function(immediate) {
    if (this._showing >= 0) return
    if (this._timeoutId) clearTimeout(this._timeoutId)
    if (immediate) {
        show.call(this, this.container)
    } else {
        this._timeoutId = setTimeout(show.bind(this, this.container), this.options.delay)
    }
}

Spinner.prototype.hide = function() {
    clearTimeout(this._timeoutId)
    Spinner.super_.prototype.hide.call(this)
}
