define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var RenderController = require('famous/views/RenderController')
    var Spinner = require('./Spinner')

    function Controller() {
        RenderController.apply(this, arguments)
        this.spinner = new Spinner(this.options)
        this._eventInput.on('spinner:show', this.show.bind(this))
        this._eventInput.on('spinner:hide', this.hide.bind(this))
    }

    inherits(Controller, RenderController)
    module.exports = Controller

    Controller.DEFAULT_OPTIONS = {
        // Wait before showing indicator
        // http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
        delay: 1000,
        inTransition: false,
        outTransition: false
    }

    Controller.prototype.show = function(immediate) {
        clearTimeout(this._timeoutId)
        this._timeoutId = setTimeout(function() {
            this.spinner.start()
            Controller.super_.prototype.show.call(this, this.spinner)
        }.bind(this), immediate ? 0 : this.options.delay)
    }

    Controller.prototype.hide = function() {
        clearTimeout(this._timeoutId)
        this.spinner.stop()
        Controller.super_.prototype.hide.call(this, this.spinner)
    }
})
