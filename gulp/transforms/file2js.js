'use strict'

var gulp = require('gulp')

var types = [
    {test: /\.html$/, type: 'html'},
    {test: /\.svg$/, type: 'svg'}
]

/**
 * - convert non-js files to js
 */
module.exports = function(options) {
    return function(filename) {
        var str2js = require('string-to-js')
        var source = require('vinyl-source-stream')
        var es = require('event-stream')

        function handle(type, code) {
            switch (type) {
                case 'html':
                case 'svg':
                    return str2js(String(code))
            }
        }

        // Return a pure writable stream.
        if (options.vinyl) {
            var type = getType(filename)
            if (!type) return es.through()
            var code = ''
            return es.through(
                function(buf) {
                    code += buf
                },
                function() {
                    code = handle(type, code)
                    this.emit('data', code)
                    this.emit('end')
                }
            )
        }

        return map(function(code, filename) {
            type = getType(filename)
            return type ? handle(type, code) : null
        })
    }
}

function getType(filename) {
    for (var i = 0; i < types.length; i++) {
        if (types[i].test.test(filename)) return types[i].type
    }
}
