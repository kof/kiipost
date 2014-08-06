'use strict'

module.exports = function(options) {
    return function() {
        var gulp = require('gulp')
        var symlink = require('gulp-symlink')

        return gulp.src(options.src)
            .pipe(symlink(options.dest))
    }
}
