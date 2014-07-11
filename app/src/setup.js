define(function(require, exports, module) {
    'use strict'

    if (!window.Promise) window.Promise = require('promise')
    var $ = require('jquery')

    // XXX
    //var API_BASE_URL = 'http://oleg.localtunnel.me'
    var API_BASE_URL = 'http://kiipost-dev.herokuapp.com'
    var SENTRY_DSN = 'https://16045f69f28a46aea86e6dc7ac253aa5@app.getsentry.com/26904'
    //var API_BASE_URL = 'http://192.168.1.11:3000'
    //var SENTRY_DSN

    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        },

        beforeSend: function(xhr, opts) {
            if (opts.url.substr(0, 4) != 'http' && typeof API_BASE_URL == 'string') {
                opts.url = API_BASE_URL + opts.url
            }
        },

        error: function(jqXhr, status, httpErrorStr) {
            log(new Error(httpErrorStr || 'Ajax error.'), jqXhr)
        }
    })

    var backbone = require('backbone')
    backbone.Model.prototype.idAttribute = '_id'

    require('jquery-ajax-retry')
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

    if (SENTRY_DSN) {
        require('components/log').setup({
            reload: false,
            sentryDsn: SENTRY_DSN
        })
    }
})
