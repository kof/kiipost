'use strict'

var charset = require('charset')
var jschardet = require('jschardet')
var Iconv = require('iconv').Iconv

// Map of charset aliases to valid mime types.
var iconvCharsets = require('./iconvCharsets.json')
var nodeCharsets = require('./nodeCharsets.json')


module.exports = function(res, data) {
    var charset = detect(res, data)

    if (nodeCharsets[charset]) {
        data = new Buffer(data, charset).toString()
    } else {
        try {
            var iconv = new Iconv(charset, 'utf-8')
            data = iconv.convert(data)
        } catch(err) {}
    }

    return data
}



function detect(res, data) {
    var detected = charset(res.headers, data)

    // In case we have got bullshit.
    var supported = iconvCharsets[detected]

    // Detect encoding using text.
    if (!supported) {
        detected = jschardet.detect(data)
        detected = detected.confidence > 0.5 ? detected.encoding : 'utf-8'
    }

    if (detected == 'utf8') detected = 'utf-8'

    return detected
}
