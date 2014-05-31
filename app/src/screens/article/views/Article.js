define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var ScrollContainer = require('famous/views/ScrollContainer')
    var Utility = require('famous/utilities/Utility')

    var BackgroundView = require('components/background/Background')
    var SpinnerView = require('components/spinner/views/Spinner')
    var ArticleModel = require('../models/Article')

    var app = require('app')

    function Article() {
        View.apply(this, arguments)

        this.surfaces = []

        this.scrollcontainer = new ScrollContainer({
            scrollview: {direction: Utility.Direction.Y}
        })
        this.add(this.scrollcontainer)
        this.scrollcontainer.sequenceFrom(this.surfaces)

        this.image = new BackgroundView()
        this.add(this.image)

        this.title = document.createElement('h1')
        this.head = new Surface({
            content: this.title,
            classes: ['article-head'],
            size: [undefined, app.context.getSize()[0] * app.GOLDEN_RATIO]
        })
        this.surfaces.push(this.head)

        this.text = new Surface({
            size: [undefined, true]
        })
        this.surfaces.push(this.text)

        this.spinner = new SpinnerView()
        this.add(new Modifier({origin: [0.5, 0.5]})).add(this.spinner)
    }

    inherits(Article, View)
    module.exports = Article

    Article.DEFAULT_OPTIONS = {}

    Article.prototype.load = function(articleId) {
        this.model = new ArticleModel({_id: articleId})
        this.spinner.show(true)
        this.model.fetch().then(function() {
            this.text.setClasses(['article-text'])
            this.setContent(this.model)
            this.spinner.hide()
        }.bind(this))
    }

    Article.prototype.setContent = function(model) {
        this.title.textContent = model.get('title')
        this.image.setContent(model.get('image').url)
        this.text.setContent(model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary') + model.get('summary'))
    }
})
