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
    extractor.extract('http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/486')(function() {
        console.log('extracted', arguments)
    })
})

