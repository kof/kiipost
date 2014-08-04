'use strict'

var server = require('test/server')

module.exports = function() {
    server.respondWith(/\/api\/users/, function(xhr) {
        var data = JSON.parse(xhr.requestBody)
        // Set session id
        data._id = '1234567'
        xhr.respond(200, null, JSON.stringify(data))
    })
}
