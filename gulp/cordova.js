'use strict'

module.exports = function(options) {
    return function(callback) {
        var gulp = require('gulp')
        var cp = require('child_process')
        var fs = require('fs')
        var path = require('path')
        var hogan = require('hogan.js')
        var Promise = require('promise')
        var readFile = Promise.denodeify(fs.readFile)
        var writeFile = Promise.denodeify(fs.writeFile)
        var symlink = Promise.denodeify(fs.symlink)
        var exec = Promise.denodeify(cp.exec)
        var del = Promise.denodeify(require('del'))

        var dest = path.resolve(process.cwd(), options.dest)
        var data = {
            id: 'com.kiipost.app',
            version: options.data.conf.version,
            name: 'Kiipost'
        }
        if (options.data.conf.env != 'prod') {
            data.id += '-' + options.data.conf.env
            data.name += '-' + options.data.conf.env
        }

        function compileConfig() {
            return readFile(dest + '/config.tpl', 'utf-8')
                .then(function(tpl) {
                    tpl = hogan.compile(tpl).render(data)
                    return writeFile(dest + '/config.xml', tpl)
                })
        }

        function prepare() {
            return exec('cd ' + dest + '; cordova prepare')
                .then(function(stdout, stderr) {
                    if (stdout) console.log(stdout.toString())
                    if (stderr) console.log(stderr.toString())
                })
        }

        function symlinkSplash() {
            var splash = dest + '/platforms/ios/' + data.name + '/Resources/splash'
            return del(splash)
                .then(function() {
                    return symlink(dest + '/splash', splash)
                })
        }

        compileConfig()
            .then(prepare)
            .then(symlinkSplash)
            .nodeify(callback)
    }
}
