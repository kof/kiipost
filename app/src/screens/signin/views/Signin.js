define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Group = require('famous/core/Group')
    var Modifier = require('famous/core/Modifier')
    var FlexibleLayout = require('famous/views/FlexibleLayout')
    var ImageSurface = require('famous/surfaces/ImageSurface')

    var ParallaxedBackgroundView = require('components/parallaxed-background/ParallaxedBackground')
    var SpinnerView = require('components/spinner/views/Spinner')
    var alert = require('components/notification/alert')

    var app = require('app')

    function Signin() {
        View.apply(this, arguments)

        var size = app.context.getSize()

        this.model = this.options.model
        this.surfaces = []

        this.signin = new Group({classes: ['signin']})
        this.add(this.signin)

        this.layout = new FlexibleLayout({
            direction: FlexibleLayout.DIRECTION_Y,
            ratios: [.4, .3, .2, .05]
        })
        this.layout.sequenceFrom(this.surfaces)
        this.signin.add(this.layout)

        this.bg = new ParallaxedBackgroundView({context: app.context})
        this.add(this.bg)

        this.logo = new Surface({
            classes: ['logo'],
            properties: {
                backgroundSize: size[1] * this.options.logoWidth + 'px'
            }
        })
        this.surfaces.push(this.logo)

        this.slogan = new Surface({
            classes: ['slogan'],
            content: 'Stay in the know.'
        })
        this.surfaces.push(this.slogan)

        this.button = new Surface({
            classes: ['button'],
            content: 'Connect with Twitter'
        })
        this.button.on('click', this._onSigninStart.bind(this))
        this.surfaces.push(this.button)

        this.terms = new Surface({
            classes: ['terms'],
            content: '<span>By continuing, you agree to our Terms and Privacy policy</span>',
        })
        this.surfaces.push(this.terms)

        this.spinner = new SpinnerView()
        this.signin.add(this.spinner)
    }

    inherits(Signin, View)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        // Relative to context height.
        logoWidth: 0.14,
        errors: {
            DISABLED: 'Please enable Kiipost app in Settings/Twitter.',
            NOT_CONNECTED: 'Please connect your twitter account in Settings/Twitter.',
            AUTH: 'Please go to twitter website and authorize iOS app in settings.',
            UNAUTHORIZED: 'Something went wrong with your twitter authentification.',
            UNKNOWN: 'Unknown error.',
        }
    }

    Signin.prototype.error = function(err) {
        var errs = this.options.errors
        alert(errs[err.type] || errs.UNKNOWN, 'Error')
    }

    Signin.prototype.load = function(data) {
        this.spinner.show()
        this.model.save(data)
            .then(function(data) {
                this._eventOutput.emit('success', data)
            }.bind(this))
            .fail(function(xhr) {
                if (xhr.statusText == 'Unauthorized') {
                    var err = new Error(xhr.statusText)
                    err.type = 'UNAUTHORIZED'
                    this.error(err)
                }
            }.bind(this))
            .always(this.spinner.hide.bind(this.spinner))
    }

    Signin.prototype._onSigninStart = function() {
        this._eventOutput.emit('start')
    }
})
