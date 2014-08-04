var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var browserify = require('gulp-browserify')
        var build = require('gulp-build')
        var conf = require('api/conf')

        return gulp.src(options.src)
            .pipe(browserify(options))
            .pipe(build({conf: conf}))
            .pipe(gulp.dest(options.dest))
    }
}
