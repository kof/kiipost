define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var Model = require('backbone').Model

    function User() {
        this.url = '/api/users'
        Model.apply(this, arguments)
        this.authorize = new Promise(function(fulfill, reject) {
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
