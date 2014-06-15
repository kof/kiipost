var m = require('mongoose')
var types = require('mongoose-types')
var _ = require('underscore')

var conf = require('api/conf')
var log = require('api/log')

var schemas = ['user', 'memo']

exports.init = function() {
    return new Promise(function(fulfill, reject) {
        // Register all types from mongoose.
        types.loadTypes(m)

        schemas.forEach(function(name) {
            m.model(name, require('./schemas/' + name))
        })

        m.connect(conf.db.url, _.clone(conf.db.options), function(err) {
            err ? reject(err) : fulfill(m.connection)
        })
        m.connection.on('error', log)
    })
}
