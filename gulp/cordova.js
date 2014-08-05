'use strict'

var gulp = require('gulp')
var cp = require('child_process')

module.exports = function(options) {
    return function(callback) {
        cp.exec('cd ./cordova; cordova prepare', function(err, stdout, stderr) {
            if (stdout) console.log(stdout.toString())
            if (stderr) console.log(stderr.toString())
            callback(err)
        })
    }
}
