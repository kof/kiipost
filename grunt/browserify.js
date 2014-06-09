var path = require('path')
var browserify = require('../package.json').overlay.browserify
var fs = require('fs')

var baseDir = path.join(__dirname, '..')

browserify.forEach(function(name) {
    var modulePath = path.join(baseDir, 'node_modules', name)
    var package = require(path.join(modulePath, 'package.json'))
    var main = package.browser || package.main
    if (!main) {
        main = path.join(modulePath, 'index.js')
        if (!fs.existsSync(main)) main = null
    }
    if (!main) return;

    if (!path.extname(main)) main += '.js'

    var destDir = path.join('app', 'lib', name)

    module.exports[name] = {
        src: [path.resolve(modulePath, main)],
        dest: path.join(destDir, name + '.js'),
        options: {bundleOptions: {standalone: name}}
    }
})
