'use strict'

var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var conf = require('api/conf')
        var browserify = require('gulp-browserify')
        var build = require('gulp-build')

        var stream = gulp.src(options.src)
            .pipe(browserify(options))
            // Replace template strings.
            .pipe(build({conf: conf, evn: options.env}))

        if (options.env == 'prod' || options.env == 'stage') {
           stream.pipe(require('gulp-uglify')())
        }

        stream.pipe(gulp.dest(options.dest))

        return stream
    }
}
