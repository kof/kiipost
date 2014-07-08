'use strict'

require('api/setup')

var program = require('commander')
var co = require('co')

var db = require('api/db')
var sync = require('api/rss/sync')
var log = require('api/log')
var error = require('api/error')

program
    .option('-v, --verbose', 'log stuff')
    .option('-u, --update', 'update existing articles')
    .option('-p, --parallel', 'max parallel feeds', Number)
    .option('-f, --feed [uri]', 'process one feed')
    .option('-l, --limit [limit]', 'limit the for the feeds find query', Number, null)
    .option('-q, --query [query]', 'mongo query to find feeds', function(obj) {
        return eval('(' + obj + ')')
    })
    .option('-r, --rest', 'enable rest interface')
    .parse(process.argv)

db.init()
    .then(function() {
        co(function *(){
            var errors = []
            var stats
            var multiError

            try {
                errors = yield sync(program)
                stats = getStats()
                stats.uniqErrors = errors.length
                stats.errors = errors
                log.info('Rss feeds sync', stats, function() {
                    process.exit()
                })
            } catch(err) {
                log(err, function() {
                    process.exit(1)
                })
            }
        })()

        if (program.rest) createServer()
    })
    .catch(function(err) {
        console.log(err.stack)
        process.exit(1)
    })

if (global.gc) {
    setInterval(gc, 5000)
}

var now = Date.now()

function getStats() {
    var stats = {}

    stats.heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024) + 'mb'
    stats.runtime = (Date.now() - now) / 1000 / 60 + 'min'
    return stats
}

var koa = require('koa')

var conf = require('api/conf')

function createServer() {
    var app = koa()
    app.use(function* () {
        this.body = getStats()
    })
    app.listen(conf.server.port)
    console.log('Listening on port', conf.server.port)
}
