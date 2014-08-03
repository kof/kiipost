define(function(require, exports, module) {
    'use strict'

    var Controller = require('backbone.controller')
    var inherits = require('inherits')
    var backbone = require('backbone')
    var _ = require('underscore')

    var log = require('app/components/log')
    var LayeredTransition = require('app/components/animations/LayeredTransition')
    var BaseTransition = require('app/components/animations/BaseTransition')

    var ios = require('./helpers/ios')
    var SigninView = require('./views/Signin')
    var TermsView = require('./views/Terms')

    var app = require('app')

    function Signin(options) {
        this.routes = {
            '': 'signin',
            'terms': 'terms'
        }
        options = _.extend({}, Signin.DEFAULT_OPTIONS, options)
        this.views = {}
        this.models = options.models
        this._firstTime = true
        Controller.call(this, options)
        this.router = this.options.router
    }

    inherits(Signin, Controller)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        defaultScreen: 'memos'
    }

    Signin.prototype.initialize = function() {
        this.layeredTransition = new LayeredTransition({size: app.context.getSize()})
        this.baseTransition = new BaseTransition()

        var signin = this.views.signin = new SigninView({model: this.models.user})
        signin.on('connect', this._onConnect.bind(this))
        signin.on('success', this._onSuccess.bind(this))
        signin.on('terms', this._onShowTerms.bind(this))
        this.views.terms = new TermsView()
        this.views.terms.on('close', this._onTermsClose.bind(this))
    }

    Signin.prototype.signin = function() {
        app.controller.show(this.views.signin, function() {
            if (!this._firstTime) return
            if (navigator.splashscreen) navigator.splashscreen.hide()
            this.views.signin.animate('in', function() {
                ios.available().then(this.do.bind(this))
            }.bind(this))
            this._firstTime = false
        }.bind(this))
    }

    Signin.prototype.terms = function() {
        this.layeredTransition.commit(app.controller)
        app.controller.show(this.views.terms, function() {
            this.layeredTransition.commit(app.controller, true)
        }.bind(this))
    }

    Signin.prototype.do = function() {
        if (ios.isSupported()) {
            var signin = this.views.signin
            signin.spinner.show(true)
            ios.signin()
                .then(signin.load.bind(signin))
                .catch(function(err) {
                    signin.spinner.hide()
                    signin.error(err)
                }.bind(this))
        }
    }

    Signin.prototype._onConnect = _.debounce(function() {
        this.do()
    }, 500, true)

    Signin.prototype._onSuccess = function(user) {
        if (!backbone.history.getFragment()) {
            this.views.signin.animate('out', function() {
                this.baseTransition.commit(app.controller)
                this.navigate(this.options.defaultScreen, {trigger: true})
            }.bind(this))
        }
        log.setUser(user)
    }

    Signin.prototype._onShowTerms = function() {
        this.terms()
        this.navigate('terms')
    }

    Signin.prototype._onTermsClose = function() {
        this.signin()
        this.navigate('')
    }
})
