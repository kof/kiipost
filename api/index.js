'use strict'

require('api/error/setup')
require('amd-loader')

var merge = require('merge')
var app = require('koa')()
var cors = require('koa-cors')
var bodyParser = require('koa-bodyparser')
var session = require('koa-session-mongodb')
var mount = require('koa-mount')

var db = require('api/db')
var conf = require('api/conf')
var log = require('api/log')

var apiModules = ['twitter']

function create(connection) {
    // http://stackoverflow.com/questions/5027705/error-in-chrome-content-type-is-not-allowed-by-access-control-allow-headers
    // https://github.com/evert0n/koa-cors/issues/13
    app.use(cors({headers: ['accept', 'x-requested-with', 'content-type']}))
    app.keys = ['632Dv76io', '8X77Zt73K', '7Zx33t38w']
    app.use(session(
        merge({collection: connection.db.collection('sessions')}, conf.session)
    ))
    app.use(bodyParser())

    // Api
    apiModules.forEach(function(module) {
        app.use(mount('/api', require('./' + module + '/router').middleware()))
    })

    app.on('error', log)
    app.listen(conf.server.port)
    console.log('Listening on port', conf.server.port)
}

db.init()
    .then(create)
    .catch(function(err) {log(err.stack)})
