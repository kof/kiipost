define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var backbone = require('backbone')

    var log = require('components/log')
    var SigninView = require('./views/Signin')
    var ios = require('./helpers/ios')

    var app = require('app')

    function Signin(options) {
        this.routes = {
            '': 'signin'
        }

        options = _.extend({}, Signin.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }

    inherits(Signin, Controller)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        defaultScreen: 'memos'
    }

    Signin.prototype.initialize = function() {
        this.view = new SigninView({model: this.models.user})
        this.view.on('start', this._onSigninStart.bind(this))
        this.view.on('success', this._onSigninSuccess.bind(this))
        ios.available().then(this._signin.bind(this))
    }

    Signin.prototype.signin = function() {
        app.controller.show(this.view, function() {
            if (navigator.splashscreen) navigator.splashscreen.hide()
        })
    }

    Signin.prototype._signin = function() {
        if (ios.isSupported()) {
            this.view.spinner.show(true)
            ios.signin()
                .then(this.view.load.bind(this.view))
                .catch(function(err) {
                    this.view.spinner.hide()
                    this.view.error(err)
                }.bind(this))
        }
    }

    Signin.prototype._onSigninStart = _.debounce(function() {
        this._signin()
    }, 500, true)

    Signin.prototype._onSigninSuccess = function(user) {
        if (!backbone.history.getFragment()) {
            this.router.navigate(this.options.defaultScreen, {trigger: true})
        }
        log.setUser(user)
    }
})
