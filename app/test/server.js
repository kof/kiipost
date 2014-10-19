'use strict'

require('app/components/sinon')

var server = module.exports = window.sinon.fakeServer.create()
server.autoRespond = true
server.autoRespondAfter = 300
