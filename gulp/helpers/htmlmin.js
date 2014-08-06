'use strict'

var minOptions = {
    collapseWhitespace: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    keepClosingSlash: true
}

/**
 * - Minify html
 */
module.exports = function(options) {
    return function(filename) {
        var gulp = require('gulp')
        var map = require('vinyl-map')
        var minify = require('html-minifier').minify
        var es = require('event-stream')

        // Minify html in all env for better testing.
        function handle(code) {
           return minify(String(code), minOptions)
        }

        // Return a pure writable stream.
        if (options.vinyl) {
            if (!/\.html$/.test(filename)) return es.through()
            var code = ''
            return es.through(
                function(buf) {
                    code += buf
                },
                function() {
                    code = handle(code)
                    this.emit('data', code)
                    this.emit('end')
                }
            )
        }

        return map(handle)
    }
}
