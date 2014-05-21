var path = require('path'),
    dependencies = require('../package.json').dependencies

var name,
    main,
    modulePath,
    baseDir,
    destDir

baseDir = path.join(__dirname, '..')

for (name in dependencies) {
    modulePath = path.join(baseDir, 'node_modules', name)
    main = require(path.join(modulePath, 'package.json')).browser
    if (!main) continue;
    destDir = path.join('app', 'lib', name)
    module.exports[name] = {
        src: [path.resolve(modulePath, main)],
        dest: path.join(destDir, name + '.js'),
        options: {bundleOptions: {standalone: name}}
    }
}
