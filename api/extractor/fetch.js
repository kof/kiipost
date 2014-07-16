'use strict'

var thunkify = require('thunkify')
var _ = require('underscore')
var request = require('superagent')

var bufferParser = require('./bufferParser')
var convertCharset = require('./convertCharset')

var conf = require('api/conf')

/**
 * Fetch website document, extract some tags, extract article.
 *
 * @param {String} url
 * @param {Function} callback
 */
module.exports = thunkify(function(url, callback) {
    var req, done
    var timeoutId

    done = _.once(function(err, data) {
        callback(err, data)
        req.abort()
    })

    req = request
        .get(url)
        .set('user-agent', conf.request.agent)
        .set('accept', conf.request.accept)
        .timeout(conf.request.timeout)
        .parse(bufferParser({
            type: /text/i,
            maxLength: 500 * 1024
        }))
        .agent(undefined)
        .buffer(true)
        .on('error', done)
        .end(function(res) {
            if (!res.ok) return done(new Error('Bad status code'))
            clearTimeout(timeoutId)
            var html = convertCharset(res, res.body)
            done(null, {url: req.url, html: html})
        })

    // Required because in case of redirect and then not emiting end
    // timeout of superagent will not work.
    // Also an extractor could stuck.
    // https://github.com/visionmedia/superagent/issues/413
    timeoutId = setTimeout(function() {
        done(new Error('Extractor timeout'))
    }, conf.request.timeout + 10000)
})
