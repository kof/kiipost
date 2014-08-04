'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var symlink = require('gulp-symlink')

        return gulp.src(options.src)
            .pipe(symlink(options.dest))
    }
}
