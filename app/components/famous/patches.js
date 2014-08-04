'use strict'

var Surface = require('famous/core/Surface')

// https://github.com/Famous/core/issues/37
Surface.prototype.emit = function(type, event) {
    if (event && !event.origin) event.origin = this
    return this.eventHandler.emit(type, event)
}
