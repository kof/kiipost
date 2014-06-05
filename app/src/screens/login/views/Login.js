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

    var app = require('app')

    function Login() {
        View.apply(this, arguments)

        var size = app.context.getSize()

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
        this.button.on('click', this._onSignUp.bind(this))
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
        // Relative to height.
        logoWidth: 0.1
    }

    Login.prototype._onSignUp = function() {
        this._eventOutput.emit('login')
    }
})
