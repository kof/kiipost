'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var conf = require('api/conf')
        var build = require('gulp-build')

        return gulp.src(options.src)
            .pipe(build({cordova: options.cordova}))
            .pipe(gulp.dest(options.dest))
    }
}
