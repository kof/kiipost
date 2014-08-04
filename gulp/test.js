'use strict'

var gulp = require('gulp')
var cp = require('child_process')

var runner = __dirname + '/../bin/test.js'

module.exports = function(options) {
    return function(callback) {
        cp.exec('node --harmony ' + runner, function(err, stdout, stderr) {
            if (stdout) console.log(stdout.toString())
            if (stderr) console.log(stderr.toString())
            callback(err)
        })
    }
}
