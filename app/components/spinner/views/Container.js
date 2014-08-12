'use strict'

var inherits = require('inherits')

var Modifier = require('famous/core/Modifier')
var ContainerSurface = require('famous/surfaces/ContainerSurface')
var Group = require('famous/core/Group')
var Transform = require('famous/core/Transform')
var Surface = require('famous/core/Surface')
var View = require('famous/core/View')

var svg = require('../images/spin.svg')

var icon = document.createElement('div')
icon.className = 'icon rotate'
icon.innerHTML = svg

function Container() {
    View.apply(this, arguments)
    this.initialize()
}

inherits(Container, View)
module.exports = Container

Container.DEFAULT_OPTIONS = {
    containerOrigin: null,
    containerTransform: null,
    containerSize: [64, 64],
    spinnerSize: [32, 32],
    hasBox: false
}

Container.prototype.initialize = function() {
    var o = this.options
    this.container = new ContainerSurface({
        classes: ['spinner-container'],
        size: o.containerSize
    })
    if (o.hasBox) this.container.addClass('has-box')
    this.containerModifier = new Modifier({
        origin: o.containerOrigin,
        transform: o.containerTransform
    })
    this.add(this.containerModifier).add(this.container)

    this.spinnerModifier = new Modifier({
        // Center it.
        transform: Transform.translate(
            (o.containerSize[0] - o.spinnerSize[0]) / 2,
            (o.containerSize[1] - o.spinnerSize[1]) / 2,
            0
        )
    })
    this.spinner = new Surface({
        classes: ['spinner'],
        content: icon,
        size: this.options.spinnerSize
    })
    this.container.add(this.spinnerModifier).add(this.spinner)
}
