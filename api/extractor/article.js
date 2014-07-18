'use strict'

var readabilitySax = require('readabilitySAX')
var htmlParser = require('htmlparser2')

var Readability = readabilitySax.Readability
var Parser = htmlParser.Parser
var CollectingHandler = htmlParser.CollectingHandler
var entities = require('entities')

/**
 * Extract article using readabilitySax.
 *
 * @param {String} url
 * @param {String} data
 * @return {Object}
 */
exports.extract = function(url, data) {
    var readability = new Readability({pageURL: url, type: 'html'})
    var handler = new CollectingHandler(readability)
    var parser = new Parser(handler, {lowerCaseTags: true})

    parser.write(data)

    for(
        var skipLevel = 1;
        readability._getCandidateNode().info.textLength < 250 && skipLevel < 4;
        skipLevel++
    ){
        readability.setSkipLevel(skipLevel)
        handler.restart()
    }

    var article = readability.getArticle()
    article.url = url
    article.title = entities.decodeHTML5(article.title).trim()
    article.html = entities.decodeHTML5(article.html.replace(/\s+/g, ' ')).trim()
    article.text = readability.getText(readability._getCandidateNode()).trim()

    return article
}
