define(function(require, exportsm, module) {
    var server = require('test/server')

    server.respondWith('GET', /\/api\/saved/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./saved.json'))
    ])
})
