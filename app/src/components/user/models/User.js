define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var Model = require('backbone').Model

    function User() {
        this.url = '/api/user'
        Model.apply(this, arguments)
        this.isAuthorized = new Promise(function(fulfill, reject) {
            if (this.isNew()) {
                this.once('change:_id', fulfill)
            } else {
                fulfill()
            }
        }.bind(this))
    }

    inherits(User, Model)
    module.exports = User
})
