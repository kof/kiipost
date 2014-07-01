'use strict'

var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var extend = require('extend')

function Controller(options) {
    this.options = extend(true, {}, Controller.defaults, options)
    this.metrics = {}
    this.stats = {}
    for (var name in this.options.metrics) {
        this.addMetric(name, this.options.metrics[name])
    }
}

inherits(Controller, EventEmitter)
module.exports = Controller

Controller.defaults = {
    metrics: {},
    interval: 200
}

Controller.prototype.addMetric = function(name, fn, options) {
    this.metrics[name] = fn(options || this.options[name])

    return this
}

Controller.prototype.start = function() {
    this._intervalId = setInterval(function() {
        var ok = this.ok
        this.check()
        // Status is ok and it has changed, emit 'ok'.
        if (this.ok && ok === false) this.emit('ok')
    }.bind(this), this.options.interval)

    for (var name in this.metrics) {
        if (typeof this.metrics[name].start == 'function') {
            this.metrics[name].start()
        }
    }

    this.check()

    return this
}

Controller.prototype.stop = function() {
    clearInterval(this._intervalId)

    for (var name in this.metrics) {
        if (typeof this.metrics[name].stop == 'function') {
            this.metrics[name].stop()
        }
    }

    return this
}

Controller.prototype.check = function() {
    this.ok = true

    for (var name in this.metrics) {
        this.stats[name] = this.metrics[name]()
        if (!this.stats[name].ok) this.ok = false
    }

    return this.ok
}
