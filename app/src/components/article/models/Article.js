define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var backbone = require('backbone')
    var _s = require('underscore.string')
    var _ = require('underscore')

    var url = require('components/utils/url')

    var wwwRegexp = /^www\./

    function Article() {
        this.urlRoot = '/api/articles'
        this.defaults = {
            images: []
        }
        Article.super_.apply(this, arguments)
    }

    inherits(Article, backbone.Model)
    module.exports = Article

    Article.prototype.parse = function(data) {
        if (data.url) {
            data.hostname = url.parse(data.url).hostname
                .replace(wwwRegexp, '')
        }

        return data
    }

    /**
     * Aggregate different sources to get just one image.
     *
     * - use images
     * - use enslosures
     * - use icon
     * @return {Object|undefined}
     */
    Article.prototype.getImage = function() {
        if (this._image) return this._image
        var a = this.attributes

        if (!_.isEmpty(a.images)) {
            this._image = a.images[0]
        } else if (!_.isEmpty(a.enclosures)) {
            this._image = _(a.enclosures).find(function(enclosure) {
                return enclosure.type == 'image'
            })
        }

        if (!this._image && a.icon) {
            this._image = {url: a.icon, isIcon: true}
        }

        return this._image
    }
})
