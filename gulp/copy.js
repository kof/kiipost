'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        return gulp.src(options.src).pipe(gulp.dest(options.dest))
    }
}
