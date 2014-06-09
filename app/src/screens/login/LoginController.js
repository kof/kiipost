define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')

    var alert = require('components/notification/alert')

    var app = require('app')

    var LoginView = require('./views/Login')
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

    LoginController.DEFAULT_OPTIONS = {
        errors: {
            DISABLED: 'Please enable Kiipost app in Settings/Twitter.',
            NOT_CONNECTED: 'Please connect your twitter account in Settings/Twitter.',
            AUTH: 'Please go to twitter website and authorize iOS app in settings.',
            UNKNOWN: 'Unknown error.'
        }
    }

    LoginController.prototype.initialize = function() {
        this.view = new LoginView()
        this.view.on('signin', this._onSignIn.bind(this))
    }

    LoginController.prototype.login = function() {
        app.controller.show(this.view, this.options)
    }

    LoginController.prototype._onSignIn = _.debounce(function() {
        if (ios.isSupported()) {
            ios.login()
                .then(function(data) {
                    console.log(data)
                    this.go()
                }.bind(this))
                .catch(function(err) {
                    var errs = this.options.errors
                    alert(errs[err.type] || errs.UNKNOWN, 'Error')
                }.bind(this))
        } else {
            this.go()
        }
    }, 500, true)

    LoginController.prototype.go = function() {
        this.router.navigate('/discover', {trigger: true})
    }
})
