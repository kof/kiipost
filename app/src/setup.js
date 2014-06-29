define(function(require, exports, module) {
    'use strict'

    var $ = require('jquery')

    // XXX
    //var API_BASE_URL = 'http://oleg.localtunnel.me'
    //var API_BASE_URL = 'http://kiipost-dev.herokuapp.com'
    var API_BASE_URL = 'http://192.168.1.11:3000'

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

    if (!window.Promise) window.Promise = require('promise')

    document.addEventListener('deviceready', function() {
        if (window.Keyboard) Keyboard.hideFormAccessoryBar(true)
    })
})
