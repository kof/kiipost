define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var Model = require('backbone').Model
    var Article = require('components/article/models/Article')

    function Memo() {
        Model.apply(this, arguments)
    }

    inherits(Memo, Model)
    module.exports = Memo

    Memo.prototype.parse = function(data) {
        if (data.articles[0]) data.articles[0] = new Article(data.articles[0], {parse: true})
        return data
    }
})
