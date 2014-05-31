define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')
    var Scrollview = require('famous/views/ScrollContainer')
    var Utility = require('famous/utilities/Utility')

    var BackgroundView = require('components/background/Background')
    var SpinnerView = require('components/spinner/views/Spinner')
    var ArticleModel = require('../models/Article')

    var app = require('app')

    function Article() {
        View.apply(this, arguments)

        this.surfaces = []

        this.scrollview = new Scrollview()
        this.add(this.scrollview)
        this.scrollview.sequenceFrom(this.surfaces)

        this.image = new BackgroundView()
        this.add(this.image)

        this.close = new Surface({
            content: 'close',
            classes: ['icomatic', 'article-close'],
            size: [true, true]
        })
        this.close.on('click', function() {
            this._eventOutput.emit('close')
        }.bind(this))
        this.surfaces.push(this.close)

        this.title = document.createElement('h1')
        this.head = new Surface({
            content: this.title,
            classes: ['article-head'],
            size: [undefined, app.context.getSize()[0] * app.GOLDEN_RATIO]
        })
        this.head.pipe(this.scrollview)
        this.surfaces.push(this.head)

        this.textContent = document.createElement('div')
        this.text = new Surface({
            content: this.textContent,
            size: [undefined, true]
        })
        this.text.pipe(this.scrollview)
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
            this.setContent(this.model)
            this.spinner.hide()
        }.bind(this))
    }

    Article.prototype.setContent = function(model) {
        this.title.textContent = model.get('title')
        this.image.setContent(model.get('image').url)
        // Set class now to avoid white screen artifact during loading.
        this.text.setClasses(['article-text'])
        this.textContent.innerHTML = model.get('summary')
        // Wait until text is rendered.
        setTimeout(function() {
            var textHeight = this.textContent.parentNode.clientHeight,
                headerHeight = this.head.getSize()[1],
                contextHeight = app.context.getSize()[1]

            if (textHeight + headerHeight < contextHeight) {
                textHeight = contextHeight - headerHeight
            }
            this.text.setSize([undefined, textHeight])
        }.bind(this), 50)
    }

    Article.prototype._setTextSize = _.debounce(function() {
        console.log(this.textContent.parentNode.clientHeight)
        this.text.setSize([undefined, this.textContent.parentNode.clientHeight])
    }, 100)
})
