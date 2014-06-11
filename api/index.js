'use strict'

require('api/error/setup')

var merge = require('merge')
var app = require('koa')()
var cors = require('koa-cors')
var bodyParser = require('koa-bodyparser')
var session = require('koa-sess')

var db = require('api/db')
var conf = require('api/conf')
var log = require('api/log')

function create(mongoStore) {
    // Middleware
    var sessionOptions = merge(true, {}, conf.session)
    sessionOptions.store = mongoStore
    app.use(session(sessionOptions))
    app.use(cors())
    app.use(bodyParser())

    // Api
    var modules = ['twitter']
    modules.forEach(function(module) {
        app.use(require('./' + module))
    })

    app.listen(conf.server.port)
    console.log('Listening on port', conf.server.port)
}

// Temporary start worker in main process to save money.
db.connect({store: true, worker: true})
    .then(create)
    .catch(function(err) {log(err.stack)})
