/**
 * Combine all html tasks.
 *
 * - template
 * - htmlmin
 */
module.exports = function(options) {
    return function() {
        var gulp = require('gulp')
        var template = require('./helpers/template')(options)
        var htmlmin = require('./helpers/htmlmin')(options)

        return gulp.src(options.src)
            .pipe(template())
            .pipe(htmlmin())
            .pipe(gulp.dest(options.dest))
    }
}
