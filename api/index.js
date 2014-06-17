'use strict'

require('./setup')

var _ = require('underscore')
var app = require('koa')()
var cors = require('koa-cors')
var bodyParser = require('koa-bodyparser')
var session = require('koa-session-mongodb')
var mount = require('koa-mount')
var compress = require('koa-compress')

var db = require('api/db')
var conf = require('api/conf')
var log = require('api/log')
var queue = require('api/queue')

var apiModules = ['user', 'memo']

function create(connection) {
    // !!! Attention never commit this.

    // app.use(require('koa-slow')({delay: 5000}))

    app.use(compress({level: 5}))

    // http://stackoverflow.com/questions/5027705/error-in-chrome-content-type-is-not-allowed-by-access-control-allow-headers
    // https://github.com/evert0n/koa-cors/issues/13
    app.use(cors(conf.cors))
    app.keys = ['632Dv76io', '8X77Zt73K', '7Zx33t38w']
    app.use(session(
        _.defaults({collection: connection.db.collection('sessions')}, conf.session)
    ))
    app.use(bodyParser())

    // Api
    apiModules.forEach(function(module) {
        app.use(mount('/api', require('./' + module + '/router').middleware()))
    })

    app.on('error', log)
    app.listen(conf.server.port)
    console.log('Listening on port', conf.server.port)

    // Temporary start worker in main process to save money.
    queue.init()
}

db.init()
    .then(create)
    .catch(log)
