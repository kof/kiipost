require('api/setup')

var m = require('mongoose')
var co = require('co')

var db = require('api/db')
var sync = require('../../sync')

db.init()
    .then(function() {
        co(function *(){
            var errors
            console.time('sync')
            try {
                errors = yield sync({
                    //feed: 'http://techcrunch.com/startups/feed/',
                    verbose: true,
                    //limit: 1,
                    //update: true
                })
            } catch(err) {
                console.log(err)
                console.log(err.stack)
            }
            console.timeEnd('sync')
            console.log('errors', errors)
            process.exit()
        })()
    })
    .catch(function(err) {
        console.log(err.stack)
    })
