'use strict'

var server = require('test/server')

module.exports = function() {
    server.respondWith('GET', /\/api\/memo/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./memos.json'))
    ])
}
