'use strict'


module.exports = function(options) {
    return function(callback) {
        var gulp = require('gulp')
        var del = require('del')
        del(options.dest, callback)
    }
}
