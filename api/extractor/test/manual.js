var extractor = require('..')
var domain = require('domain')
var co = require('co')

process.on('uncaughtException', function(err) {
    console.log('uncaught', err)
})

var d = domain.create()

d.on('error', function(err) {
    console.log(err.stack)
})

d.run(co(function* () {
    console.time('extract')
    var data = yield extractor.extract('http://s228.photobucket.com/albums/ee39/BillyG1591/?action=view&current=untitled.jpg')
    console.timeEnd('extract')
    console.log(data)
}))

