'use strict'

var server = require('app/test/server')

module.exports = function() {
    server.respondWith('GET', /\/api\/memos/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./memos.json'))
    ])

    server.respondWith('GET', /\/api\/memos\/.+/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./memo.json'))
    ])
}
