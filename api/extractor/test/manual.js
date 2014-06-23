var extractor = require('..')
var domain = require('domain')

process.on('uncaughtException', function(err) {
    console.log('uncaught', err)
})

var d = domain.create()

d.on('error', function(err) {
    console.log(err.stack)
})

d.run(function() {
    extractor.extract('http://majornelson.com/cast/2014/06/12/e3-2014-show-far-cry-4-mortal-kombat-x-and-more/')(function() {
        console.log('extracted', arguments)
    })
})

