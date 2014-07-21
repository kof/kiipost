var contentAnalysis = require('api/yahoo/contentAnalysis')
var _ = require('underscore')

/**
 * Extract entities from text using yahoo content analysis.
 *
 * @param {String} text
 * @return {Array}
 */
exports.extract = function(text) {
    return function* () {
        var data = yield contentAnalysis.analyze({text: text})
        var tags = _(data.entities).pluck('content')
        tags = _(tags).invoke('toLowerCase')
        tags = _(tags).uniq()
        return tags
    }
}
