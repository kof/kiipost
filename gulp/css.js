'use strict'

module.exports = function(options) {
    return function() {
        var gulp = require('gulp')
        var cssimport = require('gulp-cssimport')
        var es = require('event-stream')
        var map = require('vinyl-map')

        var stream = gulp.src(options.src)
            .pipe(cssimport())

        if (options.env == 'prod' || options.env == 'stage') {
            var CleanCSS = require('clean-css')
            stream = stream.pipe(map(function(code) {
                return new CleanCSS(options).minify(String(code))
            }))
        }

        stream.pipe(gulp.dest(options.dest))

        return stream
    }
}
