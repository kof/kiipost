define(function(require, exportsm, module) {
    var server = require('test/server')

    module.exports = function() {
        server.respondWith('GET', /\/api\/articles/, [
            200, {'Content-Type':'application/json'},
            JSON.stringify(require('./articles.json'))
        ])
    }
})
