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

    var Animation = require('../helpers/Animation')

    var app = require('app')

    function Signin() {
        View.apply(this, arguments)
        this.model = this.options.model
        this.initialize()
    }

    inherits(Signin, View)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        errors: {
            DISABLED: 'Please enable Kiipost app in Settings/Twitter.',
            NOT_CONNECTED: 'Please connect your twitter account in Settings/Twitter.',
            AUTH: 'Please go to twitter website and authorize iOS app in settings.',
            UNAUTHORIZED: 'Something went wrong with your twitter authentification.',
            UNKNOWN: 'Unknown error.',
        }
    }

    Signin.prototype.initialize = function() {
        this.signin = new Group({classes: ['signin']})
        this.add(this.signin)

        this.bg = {
            view: new ParallaxedBackgroundView({context: app.context}),
            modifier: new Modifier()
        }
        this.signin.add(this.bg.modifier).add(this.bg.view)

        this.logo = {
            surface: new Surface({
                classes: ['logo'],
                size: [72, 113]
            }),
            modifier: new Modifier()
        }
        this.signin.add(this.logo.modifier).add(this.logo.surface)

        this.slogan = {
            surface: new Surface({
                classes: ['slogan'],
                content: 'Stay in the know.',
                size: [undefined, true]
            }),
            modifier: new Modifier()
        }
        this.signin.add(this.slogan.modifier).add(this.slogan.surface)

        this.connect = {
            surface: new Surface({
                classes: ['connect'],
                content: 'Connect with Twitter',
                size: [undefined, true]
            }),
            modifier: new Modifier()
        }
        this.connect.surface.on('click', this._onConnect.bind(this))
        this.signin.add(this.connect.modifier).add(this.connect.surface)

        this.terms = {
            surface: new Surface({
                classes: ['terms'],
                content: '<span>By continuing, you agree to our Terms and Privacy policy</span>',
                size: [undefined, true]
            }),
            modifier: new Modifier({origin: [0.5, 0.98]})
        }
        this.signin.add(this.terms.modifier).add(this.terms.surface)

        this.spinner = new SpinnerView({origin: [0.5, 0.65]})
        this.signin.add(this.spinner)

        this.animation = new Animation(this, {context: app.context})
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

    Signin.prototype.animate = function(dir, callback) {
        this.animation[dir](callback)
    }

    Signin.prototype._onConnect = function() {
        this._eventOutput.emit('connect')
    }
})
