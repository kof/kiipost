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
        catId: 'all',
        since: null,
        sort: null,
        view: null,
        basePath: null
    }

    Stream.prototype.url = function() {
        var o = this.options
        var params = _.pick(o, 'skip', 'limit', 'view')

        if (o.since) params.since = o.since
        if (o.sort) params.sort = o.sort
        if (o.catId && o.catId != 'all') params.catId = o.catId

        return o.basePath + '?' + qs.stringify(params)
    }
})
