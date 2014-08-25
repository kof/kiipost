'use strict'

var inherits = require('inherits')

var FullArticleView = require('./FullArticle')

var View = require('famous/core/View')

function MemoFullArticle() {
    View.apply(this, arguments)
    this.initialize()
}

inherits(MemoFullArticle, View)
module.exports = MemoFullArticle

MemoFullArticle.DEFAULT_OPTIONS = {
    models: null,
    z: 2
}

MemoFullArticle.prototype.initialize = function() {
    this.articleView = new FullArticleView(this.options)
    this.articleView.container.addClass('memo-full-article')
    this.container = this.articleView.container
    this.containerModifier = this.articleView.containerModifier
    this.spinner = this.articleView.spinner
    this.articleView.pipe(this._eventOutput)
    this.add(this.articleView)
    this._optionsManager.on('change', this._onOptionsChange.bind(this))
}

MemoFullArticle.prototype.setContent = function() {
    this.articleView.relatedArticles.collection.options.relatedToMemo = this.models.memo.id
    this.articleView.setContent()
}

MemoFullArticle.prototype.setPreviewContent = function() {
    this.articleView.setPreviewContent.apply(this.articleView, arguments)
}

MemoFullArticle.prototype.cleanup = function() {
    this.articleView.cleanup.apply(this.articleView, arguments)
}

MemoFullArticle.prototype._onOptionsChange = function(option) {
    if (option.id == 'models') {
        this.models = option.value
    } else if (option.id == 'model') {
        this.model = option.value
    }

    this.articleView.setOption(option.id, option.value)
}
