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
    .option('-f, --feed [uri]', 'process one feed')
    .option('-p, --parallel [amount]', 'amount of feeds to process in parallel', Number)
    .option('-l, --limit [limit]', 'limit the for the feeds find query', Number, null)
    .option('-q, --query [query]', 'mongo query to find feeds', function(obj) {
        return eval('(' + obj + ')')
    })
    .parse(process.argv)

db.init()
    .then(function() {
        co(function *(){
            var now = Date.now()
            var errors = []
            var stats = {}
            var multiError

            try {
                errors = yield sync(program)
                stats.heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024) + 'mb'
                stats.runtime = (Date.now() - now) / 1000 / 60 + 'min'
                if (errors.length) {
                    stats.totalErrors = errors.length
                    errors = error.uniq(errors)
                    stats.uniqErrors = errors.length
                    stats.errors = errors
                }
                log.info('Rss feeds sync', stats, function() {
                    process.exit()
                })
            } catch(err) {
                log(err, function() {
                    process.exit(1)
                })
            }
        })()
    })
    .catch(function(err) {
        console.log(err.stack)
        process.exit(1)
    })
