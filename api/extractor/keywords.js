'use strict'

var gramophone = require('gramophone')
var _ = require('underscore')

var DEFAULT_OPTIONS = {
    ngrams: [1],
    score: true,
    min: 1,
    stem: true,
    // Minimal density in %.
    minDensity: 1,
    // Min amount of chars a keyword should have.
    minLength: 2
}

/**
 * Extract keywords from text, sort them by density, cut off low density keywords.
 * Result is lowercased.
 *
 * @param {String} text
 * @param {Object} [options]
 * @param {Boolean} [options.verbose]
 * @return {Array}
 */
exports.extract = function(text, options) {
    options = _.extend({}, DEFAULT_OPTIONS, options)
    var keywords = gramophone.extract(text, options)
    var total = 0

    keywords.forEach(function(obj) {
        total += obj.tf
    })

    keywords = keywords
        .filter(function(obj) {
            obj.tag = obj.term.toLowerCase()
            obj.density = obj.tf / total * 100
            return obj.term.length > options.minLength && obj.density >= options.minDensity
        })
        .sort(function(a, b) {
            return b.tf - a.tf
        })

    if (!options.verbose) {
        keywords = _(keywords).pluck('tag')
    }

    return keywords
}
