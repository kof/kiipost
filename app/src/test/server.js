define(function(require, exports, module) {
    'use strict'

    require('sinon')
    // XXX needs better packaging.
    var sinon = window.sinon
    var server = module.exports = sinon.fakeServer.create()
    server.autoRespond = true
    server.autoRespondAfter = 300;
})
