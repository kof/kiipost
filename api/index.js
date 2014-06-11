'use strict'

require('api/error/setup')

var merge = require('merge')
var app = require('koa')()
var cors = require('koa-cors')
var bodyParser = require('koa-bodyparser')
var session = require('koa-sess')
var mount = require('koa-mount')

var db = require('api/db')
var conf = require('api/conf')
var log = require('api/log')

var apiModules = ['twitter']

function create(mongoStore) {
    // Middleware
    var sessionOptions = merge(true, {}, conf.session)
    sessionOptions.store = mongoStore
    // http://stackoverflow.com/questions/5027705/error-in-chrome-content-type-is-not-allowed-by-access-control-allow-headers
    // https://github.com/evert0n/koa-cors/issues/13
    app.use(cors({headers: ['accept', 'x-requested-with', 'content-type']}))
    app.use(session(sessionOptions))
    app.use(bodyParser())

    // Api
    apiModules.forEach(function(module) {
        app.use(mount('/api', require('./' + module + '/router').middleware()))
    })

    app.listen(conf.server.port)
    console.log('Listening on port', conf.server.port)
}

// Temporary start worker in main process to save money.
db.connect({store: true, worker: true})
    .then(create)
    .catch(function(err) {log(err.stack)})
