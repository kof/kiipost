define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var Model = require('backbone').Model

    function IosSession() {
        this.url = '/api/twitter/iossession'
        Model.apply(this, arguments)
    }

    inherits(IosSession, Model)
    module.exports = IosSession
})
