define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var LoginView = require('./views/Login')

    function LoginController() {
        this.routes = {
            '': 'login'
        }
        Controller.apply(this, arguments)
        this.options = _.extend({}, LoginController.DEFAULT_OPTIONS, this.options)
        this.router = this.options.router
    }

    inherits(LoginController, Controller)
    module.exports = LoginController

    LoginController.DEFAULT_OPTIONS = {}

    LoginController.prototype.initialize = function() {
        this.view = new LoginView()
        this.view.on('login', function() {
            this.router.navigate('/discover', {trigger: true})
        }.bind(this))
    }

    LoginController.prototype.login = function() {
        app.controller.show(this.view, this.options)
    }
})
