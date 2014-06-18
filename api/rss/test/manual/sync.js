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
                yield sync({feed: 'http://rac1.org/elmon/categories/a-cop-de-clic/feed/', verbose: true})
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