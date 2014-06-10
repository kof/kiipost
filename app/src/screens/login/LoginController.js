define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var LoginView = require('./views/Login')
    var IosSessionModel = require('./models/IosSession')
    var ios = require('./helpers/ios')

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
        this.view = new LoginView({model: new IosSessionModel()})
        this.view.on('login:start', this._onLoginStart.bind(this))
        this.view.on('login:success', this._onLoginSuccess.bind(this))
        ios.isAvailable().then(this._login.bind(this))
    }

    LoginController.prototype.login = function() {
        app.controller.show(this.view, this.options)
    }

    LoginController.prototype._login = function() {
        this.view.spinner.show(true)
        if (ios.isSupported()) {
            ios.login()
                .then(this.view.load.bind(this.view))
                .catch(this.view.error.bind(this.view))
        }
    }

    LoginController.prototype._go = function() {
        this.router.navigate('/discover', {trigger: true})
    }

    LoginController.prototype._onLoginStart = _.debounce(function() {
        this._login()
    }, 500, true)

    LoginController.prototype._onLoginSuccess = function() {
        this._go()
    }
})
