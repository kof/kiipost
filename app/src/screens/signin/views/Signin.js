define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Group = require('famous/core/Group')
    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')

    var ParallaxedBackgroundView = require('components/parallaxed-background/ParallaxedBackground')
    var SpinnerView = require('components/spinner/views/Spinner')
    var alert = require('components/notification/alert')

    var Transition = require('../helpers/Transition')

    var app = require('app')

    function Signin() {
        View.apply(this, arguments)

        var o = this.options

        this.model = o.model

        this.signin = new Group({classes: ['signin']})
        this.add(this.signin)

        this.bg = new ParallaxedBackgroundView({context: app.context})
        this.bgModifier = new Modifier({opacity: o.bg.opacity})
        this.signin.add(this.bgModifier).add(this.bg)

        this.logo = new Surface({
            classes: ['logo'],
            size: o.logo.size
        })
        this.logoModifier = new Modifier({
            transform: Transform.translate(
                app.context.getSize()[0] * o.logo.left - o.logo.size[0] / 2,
                app.context.getSize()[1] * o.logo.top - o.logo.size[1] / 2
            )
        })
        this.signin.add(this.logoModifier).add(this.logo)

        this.slogan = new Surface({
            classes: ['slogan'],
            content: 'Stay in the know.',
            size: o.slogan.size
        })
        this.sloganModifier = new Modifier({origin: o.slogan.origin, opacity: o.slogan.opacity})
        this.signin.add(this.sloganModifier).add(this.slogan)

        this.connect = new Surface({
            classes: ['connect'],
            content: 'Connect with Twitter',
            size: o.connect.size
        })
        this.connectModifier = new Modifier({
            origin: o.connect.origin,
            opacity: o.connect.opacity
        })
        this.connect.on('click', this._onSigninStart.bind(this))
        this.signin.add(this.connectModifier).add(this.connect)

        /*
        this.terms = new Surface({
            classes: ['terms'],
            content: '<span>By continuing, you agree to our Terms and Privacy policy</span>',
        })
        */

        this.spinner = new SpinnerView({origin: [0.5, 0.65]})
        this.signin.add(this.spinner)

        this.transition = new Transition(this, {context: app.context})
    }

    inherits(Signin, View)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        logo: {
            size: [72, 113],
            top: 0.5,
            left: 0.5
        },
        slogan: {
            size: [undefined, true],
            origin: [0.5, 0.5],
            opacity: 0
        },
        connect: {
            origin: [0.5, 0.85],
            opacity: 0,
            size: [undefined, true]
        },
        bg: {
            opacity: 0
        },
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

    Signin.prototype.transit = function(dir, callback) {
        this.transition[dir](callback)
    }

    Signin.prototype._onSigninStart = function() {
        this._eventOutput.emit('start')
    }
})
