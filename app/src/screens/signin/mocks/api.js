define(function(require, exportsm, module) {
    var server = require('test/server')

    server.respondWith(/\/api\/twitter\/iossession/, function(xhr) {
        var data = JSON.parse(xhr.requestBody)
        // Set session id
        data._id = '1234567'
        xhr.respond(200, null, JSON.stringify(data))
    })
})
