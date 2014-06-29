(function() {
    'use strict'

    var ready = false

    define(function(require, exports, module) {

        var Promise = window.Promise || require('promise')

        module.exports = new Promise(function(fulfill) {
            if (ready) return fulfill()
            document.addEventListener('deviceready', fulfill)
        })
    })

    document.addEventListener('deviceready', function() {
        ready = true
    })
}())
