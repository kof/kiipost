'use strict'

var glossary = require('glossary')

// Min amount of chars a keyword should have.
var MIN_LENGTH = 2

// Min amount of times the word should be in the article.
var MIN_FREQ = 2

// Cap the amount of overall keywords.
var MAX_AMOUNT = 10

/**
 * Extract keywords from text.
 * Result is lowercased.
 *
 * @param {String} text
 * @return {Array}
 */
exports.extract = function(text) {
    var extractor = glossary({minFreq: MIN_FREQ, collapse: true, verbose: true})

    return extractor.extract(text)
        .sort(function(a, b) {
            return b.count - a.count
        })
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
        // XXX
        // This is temporary solution to reduce amount of irrelevant articles.
        // When we implement personal relevance, we can have way more keywords
        // per article and do better selection.
        .splice(0, MAX_AMOUNT)
}
