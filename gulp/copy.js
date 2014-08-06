'use strict'

module.exports = function(options) {
    return function() {
        var gulp = require('gulp')
        return gulp.src(options.src).pipe(gulp.dest(options.dest))
    }
}
