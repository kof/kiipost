define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var FlexibleLayout = require('famous/views/FlexibleLayout')
    var ImageSurface = require('famous/surfaces/ImageSurface')

    var BackgroundView = require('components/background/Background')
    var SpinnerView = require('components/spinner/views/Spinner')
    var alert = require('components/notification/alert')

    var app = require('app')

    function Login() {
        View.apply(this, arguments)

        var size = app.context.getSize()

        this.model = this.options.model
        this.surfaces = []

        this.layout = new FlexibleLayout({
            direction: FlexibleLayout.DIRECTION_Y,
            ratios: [.3, .35, .3, .05]
        })
        this.layout.sequenceFrom(this.surfaces)
        this.add(this.layout)

        this.bg = new BackgroundView()
        this.add(this.bg)

        this.logo = new Surface({
            classes: ['login-logo'],
            properties: {
                backgroundSize: size[1] * this.options.logoWidth + 'px'
            }
        })
        this.surfaces.push(this.logo)

        this.slogan = new Surface({
            classes: ['login-slogan'],
            content: 'Stay in the know, no matter how unique your passions are.'
        })
        this.surfaces.push(this.slogan)

        this.button = new Surface({
            classes: ['login-button'],
            content: 'Sign in with Twitter'
        })
        this.button.on('click', this._onLoginStart.bind(this))
        this.surfaces.push(this.button)

        this.terms = new Surface({
            classes: ['login-terms'],
            content: '<span>By continuing, you agree to our Terms and Privacy policy</span>',
        })
        this.surfaces.push(this.terms)

        this.spinner = new SpinnerView()
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.spinner)
    }

    inherits(Login, View)
    module.exports = Login

    Login.DEFAULT_OPTIONS = {
        // Relative to context height.
        logoWidth: 0.1,
        errors: {
            DISABLED: 'Please enable Kiipost app in Settings/Twitter.',
            NOT_CONNECTED: 'Please connect your twitter account in Settings/Twitter.',
            AUTH: 'Please go to twitter website and authorize iOS app in settings.',
            UNAUTHORIZED: 'Something went wrong with your twitter authentification.',
            UNKNOWN: 'Unknown error.',
        }
    }

    Login.prototype.error = function(err) {
        var errs = this.options.errors
        alert(errs[err.type] || errs.UNKNOWN, 'Error')
    }

    Login.prototype.load = function(data) {
        this.spinner.show()
        this.model.save(data)
            .then(function() {
                this._eventOutput.emit('login:success')
            }.bind(this))
            .fail(function(xhr) {
                if (xhr.statusText == 'Unauthorized') {
                    this.error({type: 'UNAUTHORIZED'})
                }
            }.bind(this))
            .always(this.spinner.hide.bind(this.spinner))
    }

    Login.prototype._onLoginStart = function() {
        this._eventOutput.emit('login:start')
    }
})
