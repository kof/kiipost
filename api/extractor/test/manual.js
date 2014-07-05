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
    extractor.extract('http://thepioneerwoman.com/blog/2014/06/saturday-gathering/', console.log)
})

