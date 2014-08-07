'use strict'

module.exports = function(options) {
    return function(callback) {
        var gulp = require('gulp')
        var cp = require('child_process')
        var fs = require('fs')
        var path = require('path')
        var hogan = require('hogan.js')

        var dest = path.resolve(process.cwd(), options.dest)

        function compileConfig() {
            fs.readFile(dest + '/config.tpl', 'utf-8', function(err, tpl) {
                if (err) return callback(err)
                var data = {
                    id: 'com.kiipost.app',
                    version: options.data.conf.version,
                    name: 'Kiipost'
                }
                if (options.data.conf.env != 'prod') {
                    data.id += '-' + options.data.conf.env
                    data.name += '-' + options.data.conf.env
                }

                tpl = hogan.compile(tpl).render(data)
                fs.writeFile(dest + '/config.xml', tpl, function(err) {
                    if (err) return callback(err)
                    prepare()
                })
            })
        }

        function prepare() {
            cp.exec('cd ' + dest + '; cordova prepare', function(err, stdout, stderr) {
                if (stdout) console.log(stdout.toString())
                if (stderr) console.log(stderr.toString())
                callback(err)
            })
        }

        compileConfig()
    }
}
