'use strict'

var charset = require('charset')
var jschardet = require('jschardet')
var Iconv = require('iconv').Iconv
var es = require('event-stream')

var ExtError = require('api/error').ExtError

// Map of charset aliases to valid mime types.
var charsets = require('./iconv-charsets.json')

function CharsetConverter(res) {
    this.res = res
    this.data = null
    this.charset = null
    this.iconv = null
}

module.exports = CharsetConverter

CharsetConverter.prototype.getStream = function() {
    return this.stream = es.through(this._onData.bind(this), this._onEnd.bind(this))
}

CharsetConverter.prototype._onData = function(data) {
    var error
    if (this.data) data = Buffer.concat([this.data, data])
    if (!this.charset) this.charset = this._detectCharset(data)

    // Init iconv if encoding is not utf-8.
    if (!this.iconv && this.charset != 'utf-8') {
        try {
            this.iconv = new Iconv(this.charset, 'utf-8')
        } catch(err) {
            error = err
            this.stream.emit('error', new ExtError(err.message, {
                err: err,
                encoding: this.charset
            }))
        }
    }

    if (this.iconv) {
        try {
            data = this.iconv.convert(data)
            // We are able to convert, now we can cleanup our data.
            this.data = null
        } catch(err) {
            error = err
            // In case of f.e. charset big5 or gb2312, we need larger chunks to convert
            // Example: http://heaven.branda.to/~thinker/GinGin_CGI.py/rssfeed
            if (err.code == 'EINVAL' || err.code == 'EILSEQ') {
                this.data = data
            } else {
                this.stream.emit('error', new ExtError(err.message, {
                    err: err,
                    data: String(data)
                }))
            }
        }
    }

    if (!error) this.stream.emit('data', data)
}

CharsetConverter.prototype._onEnd = function() {
    // We have data that hasn't been emited because of conversion issues.
    // Now we emit it as it is
    if (this.data && this.data.length) {
        this.stream.emit('data', this.data)
    }
    this.data = null
    this.charset = null
    this.iconv = null
    this.stream.emit('end')
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
CharsetConverter.prototype._detectCharset = function(data) {
    var detected = charset(this.res.headers, data)

    // Verify what we get from the website is also supported.
    var supported = detected && charsets[detected.toLowerCase()]

    // Detect encoding using text.
    if (!supported) {
        detected = jschardet.detect(data)
        detected = detected.confidence > 0.5 ? detected.encoding : 'utf-8'
    }

    if (detected == 'utf8') detected = 'utf-8'

    return detected
}
