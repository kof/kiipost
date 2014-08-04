'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function(callback) {
        var del = require('del')

        del(options.dest, callback)
    }
}
