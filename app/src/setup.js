define(function(require, exports, module) {
    'use strict'

    var log = require('log')
    var $ = require('jquery')

    // XXX
    var API_BASE_URL = 'http://kiipost.local:3000'

    $.ajaxSetup({
        beforeSend: function(xhr, opts) {
            if (opts.url.substr(0, 4) != 'http' && typeof API_BASE_URL == 'string') {
                opts.url = API_BASE_URL + opts.url
            }
        },

        error: function(jqXhr, status, httpErrorStr) {
            log(new Error(httpErrorStr || 'Ajax error.'), jqXhr)
        },

        statusCode: {
            503: function(jqXhr) {
                var wait = jqXhr.getResponseHeader('retry-after')
                var options = this

                wait = parseInt(wait, 10) || 5

                setTimeout(function() {
                    $.ajax(options)
                }, wait * 1000)
            }
        }
    })

    var backbone = require('backbone')
    backbone.Model.prototype.idAttribute = '_id'

    if (!window.Promise) window.Promise = require('promise')
})
