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
        this.view.on('connect', this._onConnect.bind(this))
        this.view.on('success', this._onSuccess.bind(this))
    }

    Signin.prototype.signin = function() {
        app.controller.show(this.view, function() {
            if (navigator.splashscreen) navigator.splashscreen.hide()
            this.view.animate('in', function() {
                ios.available().then(this.do.bind(this))
            }.bind(this))
        }.bind(this))
    }

    Signin.prototype.do = function() {
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

    Signin.prototype._onConnect = _.debounce(function() {
        this.do()
    }, 500, true)

    Signin.prototype._onSuccess = function(user) {
        if (!backbone.history.getFragment()) {
            this.view.animate('out', function() {
                this.navigate(this.options.defaultScreen, {trigger: true})
            }.bind(this))
        }
        log.setUser(user)
    }
})
