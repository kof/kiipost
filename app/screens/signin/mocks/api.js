'use strict'

var server = require('app/test/server')

module.exports = function() {
    server.respondWith('POST', /\/api\/users/, [
        200, {'Content-Type':'application/json'},
        JSON.stringify(require('./users.json'))
    ])
}
