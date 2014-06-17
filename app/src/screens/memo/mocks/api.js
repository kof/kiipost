define(function(require, exportsm, module) {
    var server = require('test/server')

    server.respondWith('GET', /\/api\/memo/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./memos.json'))
    ])
})
