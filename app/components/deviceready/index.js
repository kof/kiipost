'use strict'

var ready = false
var Promise = window.Promise || require('promise')

document.addEventListener('deviceready', function() {
    ready = true
})

module.exports = new Promise(function(fulfill) {
    if (ready) return fulfill()
    document.addEventListener('deviceready', fulfill)
})
