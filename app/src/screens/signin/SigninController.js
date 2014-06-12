define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')

    var app = require('app')

    var SigninView = require('./views/Signin')
    var ios = require('./helpers/ios')

    function SigninController(options) {
        this.routes = {
            '': 'signin'
        }

        options = _.extend({}, SigninController.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }

    inherits(SigninController, Controller)
    module.exports = SigninController

    SigninController.DEFAULT_OPTIONS = {}

    SigninController.prototype.initialize = function() {
        this.view = new SigninView({model: this.models.user})
        this.view.on('signin:start', this._onSigninStart.bind(this))
        this.view.on('signin:success', this._onSigninSuccess.bind(this))
        ios.isAvailable().then(this._signin.bind(this))
    }

    SigninController.prototype.signin = function() {
        app.controller.show(this.view, this.options)
    }

    SigninController.prototype._signin = function() {
        this.view.spinner.show(true)
        if (ios.isSupported()) {
            ios.signin()
                .then(this.view.load.bind(this.view))
                .catch(this.view.error.bind(this.view))
        }
    }

    SigninController.prototype._go = function() {
        this.router.navigate('/discover', {trigger: true})
    }

    SigninController.prototype._onSigninStart = _.debounce(function() {
        this._signin()
    }, 500, true)

    SigninController.prototype._onSigninSuccess = function() {
        this._go()
    }
})
