var Controller = module.exports = require('./lib/controller')
var extend = require('extend')

extend(Controller.defaults.metrics, {
    cpu: require('./lib/cpu'),
    mem: require('./lib/mem')
})

