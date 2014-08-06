'use strict'

module.exports = function(options) {
    return function() {
        var gulp = require('gulp')
        var eslint = require('gulp-eslint')
        var jscs = require('gulp-jscs')

        return gulp.src(options.src)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(jscs())
    }
}
