'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var cssimport = require('gulp-cssimport')

        var stream = gulp.src(options.src)
            .pipe(cssimport())

        if (options.env == 'prod' || options.env == 'stage') {
            stream.pipe(require('gulp-minify-css')())
        }

        stream.pipe(gulp.dest(options.dest))

        return stream
    }
}
