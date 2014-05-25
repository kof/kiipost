define(function(require, exports, module) {
    var sinon = require('sinon/sinon')

    var fakeXhr = require('sinon/sinon/util/fake_xml_http_request')
    var event = require('sinon/sinon/util/event')
    var fakeServer = require('sinon/sinon/util/fake_server')
    var server = module.exports = sinon.fakeServer.create()
    server.autoRespond = true
    //server.autoRespondAfter = 500;
})
