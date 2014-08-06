'use strict'

/**
 * - browserify
 * - apply all html tasks on required html file
 * - compile/render template strings for js
 * - uglify in prod/stage
 */
module.exports = function(options) {
    options.vinyl = true

    return function() {
        var gulp = require('gulp')
        var htmlmin = require('./transforms/htmlmin')(options)
        var template = require('./transforms/template')(options)
        var file2js = require('./transforms/file2js')(options)
        var source = require('vinyl-source-stream')
        var browserify = require('browserify')
        var es = require('event-stream')

        var stream = browserify(options.entry)
            .transform(template)
            .transform(htmlmin)
            .transform(file2js)
            .bundle()
            .pipe(template('fake.html'))

        if (options.env == 'prod' || options.env == 'stage') {
            var uglify = require('uglify-js')
            var code = ''
            options.fromString = true
            stream = stream.pipe(es.through(
                function(buf) {
                    code += buf
                },
                function() {
                    code = uglify.minify(String(code), options).code
                    this.emit('data', code)
                    this.emit('end')
                }
            ))
        }

        stream
            .pipe(source('index.js'))
            .pipe(gulp.dest(options.dest))

        return stream
    }
}
