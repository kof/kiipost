'use strict'

var options = {
    script: './api/index',
    nodeArgs: '--harmony',
    watch: './api',
    ext: 'js'
}

module.exports = function() {
    return function(callback) {
        var gulp = require('gulp')
        var nodemon = require('gulp-nodemon')

        nodemon(options)
            .once('start', callback)
    }
}
