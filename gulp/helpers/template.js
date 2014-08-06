'use strict'

/**
 * - Compile/render mustache templates.
 */
module.exports = function(options) {
    return function(filename) {
        var gulp = require('gulp')
        var map = require('vinyl-map')
        var hogan = require('hogan.js')
        var es = require('event-stream')

        function handle(code) {
            return hogan.compile(String(code)).render(options.data)
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
