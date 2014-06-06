define(function(require, exports, module) {
    'use strict'

    var server = module.exports = sinon.fakeServer.create()
    server.autoRespond = true
    server.autoRespondAfter = 300;
})
