'use strict'

var gulp = require('gulp')

var minOptions = {
    collapseWhitespace: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    keepClosingSlash: true
}

module.exports = function(options) {
    return function() {
        var conf = require('api/conf')
        var build = require('gulp-build')
        var htmlmin = require('gulp-htmlmin')

        return gulp.src(options.src)
            // Replace template strings.
            .pipe(build({cordova: options.cordova}))
            // Minify html in all env for better testing.
            .pipe(htmlmin(minOptions))
            .pipe(gulp.dest(options.dest))
    }
}
