require('api/setup')

var m = require('mongoose')
var co = require('co')

var db = require('api/db')
var sync = require('../../sync')

db.init()
    .then(function() {
        co(function *(){
            console.time('sync')
            try {
                yield sync({
                    feed: 'http://techcrunch.com/startups/feed/',
                    verbose: true,
                    retry: false,
                    limit: 100,
                    update: true
                })
            } catch(err) {
                console.log(err)
                console.log(err.stack)
            }
            console.timeEnd('sync')
            process.exit()
        })()
    })
    .catch(function(err) {
        console.log(err.stack)
    })
