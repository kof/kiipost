define(function(require, exports, module) {
    'use strict'

    var server = module.exports = window.sinon.fakeServer.create()
    server.autoRespond = true
    server.autoRespondAfter = 300
})
