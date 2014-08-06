var fs = require('fs')
fs.readdirSync(__dirname).forEach(function(name) {
    if (/\.js$/.test(name)) exports[name.substr(0, name.length - 3)] = require('./' + name)
})
