define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var backbone = require('backbone')

    function IosSession() {
        this.url = '/api/twitter/iossession'
        IosSession.super_.apply(this, arguments)
    }

    inherits(IosSession, backbone.Model)
    module.exports = IosSession
})
