var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var conf = require('api/conf')
        var browserify = require('gulp-browserify')
        var build = require('gulp-build')

        return gulp.src(options.src)
            .pipe(browserify(options))
            // Replace template strings.
            .pipe(build({conf: conf}))
            .pipe(gulp.dest(options.dest))
    }
}
