'use strict'

var Promise = require('promise')

var ready = false

if (window.cordova) {
    document.addEventListener('deviceready', function() {
        ready = true
    })
} else {
    ready = true
}

module.exports = new Promise(function(fulfill) {
    if (ready) return fulfill()
    document.addEventListener('deviceready', fulfill)
})
