'use strict'

/**
* Setup the app.
*/

if (!window.Promise) window.Promise = require('promise')
var $ = require('jquery')
var backbone = require('backbone')

var conf = require('app/conf')
var log = require('app/components/log')

require('jquery.ajax-retry')

$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    },

    beforeSend: function(xhr, opts) {
        if (opts.url.substr(0, 4) != 'http') {
            opts.url = conf.server.baseUrl + opts.url
        }
    },

    error: function(jqXhr, status, httpErrorStr) {
        log(new Error(httpErrorStr || 'Ajax error.'), jqXhr)
    }
})

backbone.Model.prototype.idAttribute = '_id'

backbone.ajax = function(options) {
    return $.ajax(options).retry({
        times: Infinity,
        timeout: 5000,
        statusCodes: [502, 503, 504]
    })
}

// For consistency with famous and node, we use always .emit.
backbone.Collection.prototype.emit =
backbone.View.prototype.emit =
backbone.Model.prototype.emit = backbone.Events.trigger
backbone.$ = $

if (conf.server.sentryDsn) {
    log.setup({
        reload: false,
        sentryDsn: conf.server.sentryDsn
    })
}
