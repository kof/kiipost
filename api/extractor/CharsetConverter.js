'use strict'

var charset = require('charset')
var jschardet = require('jschardet')
var Iconv = require('iconv').Iconv
var es = require('event-stream')

var ExtError = require('api/error').ExtError

function CharsetConverter(req, res) {
    this.req = req
    this.res = res
}

module.exports = CharsetConverter

CharsetConverter.prototype.getStream = function() {
    return this.stream = es.through(this.convert.bind(this))
}

CharsetConverter.prototype.convert = function(data) {
    if (this.collector) data = Buffer.concat([this.collector, data])
    if (!this.encoding) this.encoding = this.detectEncoding(data)

    // Init iconv if encoding is not utf-8.
    if (!this.iconv && this.encoding != 'utf-8') {
        try {
            this.iconv = new Iconv(this.encoding, 'utf-8')
        } catch(err) {
            return this.stream.emit('error', new ExtError(err.message, {
                err: err,
                encoding: this.encoding
            }))
        }
    }

    if (this.iconv) {
        try {
            data = this.iconv.convert(data)
            // We are able to convert, now we can cleanup our data this.collector.
            this.collector = null
        } catch(err) {
            // In case of f.e. charset big5 or gb2312, we can't stream, so we load
            // chunks until it is convertable
            // Example: http://heaven.branda.to/~thinker/GinGin_CGI.py/rssfeed
            if (err.code == 'EINVAL' || err.code == 'EILSEQ') {
                this.collector = data
            } else {
                this.stream.emit('error', new ExtError(err.message, {
                    err: err,
                    data: data.toString()
                }))
            }
            return
        }
    }

    this.stream.emit('data', data)
}

/**
 * Get charset from
 * - header
 * - html body
 * - detect from text
 * - utf-8 normalized
 *
 * @param {Response} res
 * @param {Buffer} data
 * @return {String}
 */
CharsetConverter.prototype.detectEncoding = function(data) {
    var encoding = charset(this.res.headers, data)
    var detected

    if (encoding == 'utf8') encoding = 'utf-8'

    // Detect encoding using text.
    if (!encoding) {
        detected = jschardet.detect(data)
        encoding = detected.confidence > 0.5 ? detected.encoding : 'utf-8'
    }

    return encoding
}
