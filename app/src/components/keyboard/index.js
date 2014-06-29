define(function(require, exports, module) {
    'use strict'

    var _ = require('underscore')
    var EventEmitter = require('famous/core/EventEmitter')
    var Promise = window.Promise || require('promise')

    var deviceready = require('components/deviceready')

    var ready, keyboard

    ready = new Promise(function(fulfill, reject) {
        deviceready.then(function() {
            keyboard = window.Keyboard
            if (!keyboard) return reject(new Error('No keyboard plugin'))
            fulfill()
        })
    })

    module.exports = exports = new EventEmitter()

    exports.hideFormAccessoryBar = function(val) {
        keyboard.hideFormAccessoryBar(val)
    }

    exports.disableScrollingInShrinkView = function(val) {
        keyboard.disableScrollingInShrinkView(val)
    }

    ready.then(function() {
        ['show', 'hide', 'showing', 'hiding'].forEach(function(name) {
            keyboard['on' + name] = function() {
                exports.emit(name)
            }
        })
    })

    // Wrap all methods in function verifying deviceready and Keyboard namespace.
    _.each(exports, function(fn, name) {
        exports[name] = function() {
            var args = arguments
            ready.then(function() {
                fn.apply(exports, args)
            })

            return this
        }
    })
})
