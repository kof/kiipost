var glossary = require('glossary')

var MIN_LENGTH = 2

exports.extract = function(text, max) {
    var extractor = glossary({minFreq: 2, collapse: true, verbose: true})

    return extractor
        .extract(text)
        .sort(function(a, b) {
            return b.count - a.count
        })
        .splice(0, max)
        .map(function(obj) {
            return obj.norm
                .toLowerCase()
                .trim()
                // We don't need non alpha-numeric chars in the tags?
                .replace(/\W/g, '')
        })
        .filter(function(str) {
            return str.length > MIN_LENGTH
        })
}
