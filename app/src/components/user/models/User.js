define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var Model = require('backbone').Model

    function User() {
        this.url = '/api/user'
        Model.apply(this, arguments)
    }

    inherits(User, Model)
    module.exports = User
})
