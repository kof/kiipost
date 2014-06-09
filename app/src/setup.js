define(function(require, exports, module) {
    'use strict'

    var $ = require('jquery')
    $.ajaxSetup({cache: false})
    var backbone = require('backbone')
    backbone.Model.prototype.idAttribute = '_id'

    if (!window.Promise) window.Promise = require('promise')
})
