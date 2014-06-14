define(function(require, exports, module) {
    'use strict'

    var backbone = require('backbone')
    var inherits = require('inherits')
    var _ = require('underscore')
    var qs = require('qs')

    function Stream(models, options) {
        Stream.super_.apply(this, arguments)
        this.options = _.extend({}, Stream.DEFAULT_OPTIONS, options)
    }

    inherits(Stream, backbone.Collection)
    module.exports = Stream

    Stream.DEFAULT_OPTIONS = {
        limit: 30,
        skip: 0,
        basePath: null
    }

    Stream.prototype.url = function() {
        var o = this.options
        var params = _.pick(o, 'skip', 'limit')
        return o.basePath + '?' + qs.stringify(params)
    }
})
