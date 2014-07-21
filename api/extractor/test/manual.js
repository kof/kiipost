var extractor = require('..')
var co = require('co')

console.time('extract')

co(function* () {
    return yield extractor.extract('http://parallax-view.org/2014/06/25/review-curious-girl/')
})(function(err, data) {
    console.timeEnd('extract')
    if (err) console.log(err, err.stack)
    console.log(data)
})

