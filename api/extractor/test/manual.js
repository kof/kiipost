var extractor = require('..')
var co = require('co')

console.time('extract')

co(function* () {
    return yield extractor.extract('http://sublimetexttips.com/giveaways/sublime-text-giveaway/?lucky=41809')
})(function(err, data) {
    console.timeEnd('extract')
    if (err) console.log(err.stack)
    console.log(data)
})

