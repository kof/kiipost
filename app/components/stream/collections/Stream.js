'use strict'

var backbone = require('backbone')
var inherits = require('inherits')
var _ = require('underscore')
var qs = require('qs')

function Stream(models, options) {
    Stream.super_.apply(this, arguments)
    this.options = _.extend({}, Stream.DEFAULT_OPTIONS, options)
    this.urlRoot = this.options.urlRoot
    this.on('sync', this._onSync.bind(this))
}

inherits(Stream, backbone.Collection)
module.exports = Stream

Stream.DEFAULT_OPTIONS = {
    limit: 50,
    skip: 0,
    urlRoot: null,
    relatedToArticle: null,
    relatedToMemo: null,
    qs: ['skip', 'limit', 'relatedToArticle', 'relatedToMemo']
}

Stream.prototype.url = function() {
    var query = {}

    _(this.options).each(function(value, option, options) {
        if (value != null && options.qs.indexOf(option) >= 0) query[option] = value
    })

    return this.urlRoot + '?' + qs.stringify(query)
}

Stream.prototype._onSync = function() {
    // We reached end of the list.
    if (this.length < this.options.limit) {
        this.emit('end')
    }
}

Stream.prototype.reset = function() {
    this.options.skip = 0
    return Stream.super_.apply(this, arguments)
}
