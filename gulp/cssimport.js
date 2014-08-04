var gulp = require('gulp')

module.exports = function(options) {
    return function() {
        var cssimport = require('gulp-cssimport')

        return gulp.src(options.src)
            .pipe(cssimport())
            .pipe(gulp.dest(options.dest))
    }
}
