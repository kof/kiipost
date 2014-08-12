'use strict'

var inherits = require('inherits')

var RenderController = require('famous/views/RenderController')

var Container = require('./Container')

/**
 * Contains the logic for showing/hiding spinner with delay.
 * http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
 */
function Renderer() {
    RenderController.apply(this, arguments)
    this.container = new Container(this.options.spinner)
}

inherits(Renderer, RenderController)
module.exports = Renderer

Renderer.DEFAULT_OPTIONS = {
    spinner: null,
    delay: 1000,
    inTransition: {duration: 0},
    outTransition: {duration: 0}
}

Renderer.prototype.getSize = function() {
    return this.container.getSize()
}

var show = RenderController.prototype.show
Renderer.prototype.show = function(immediate) {
    if (this._showing >= 0) return
    if (this._timeoutId) clearTimeout(this._timeoutId)
    if (immediate) {
        show.call(this, this.container)
    } else {
        this._timeoutId = setTimeout(show.bind(this, this.container), this.options.delay)
    }
}

var hide = RenderController.prototype.hide
Renderer.prototype.hide = function() {
    if (this._timeoutId) clearTimeout(this._timeoutId)
    if (this._showing >= 0) hide.call(this)
}
