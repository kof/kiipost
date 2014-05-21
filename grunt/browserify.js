var path = require('path'),
    dependencies = require('../package.json').dependencies,
    fs = require('fs')

var name,
    main,
    modulePath,
    baseDir,
    destDir,
    package

baseDir = path.join(__dirname, '..')

for (name in dependencies) {
    modulePath = path.join(baseDir, 'node_modules', name)
    package = require(path.join(modulePath, 'package.json'))
    main = package.browser || package.main
    if (!main) {
        main = path.join(modulePath, 'index.js')
        if (!fs.existsSync(main)) main = null
    }
    if (!main) continue;
    destDir = path.join('app', 'lib', name)
    console.log(main)
    module.exports[name] = {
        src: [path.resolve(modulePath, main)],
        dest: path.join(destDir, name + '.js'),
        options: {bundleOptions: {standalone: name}}
    }
}
