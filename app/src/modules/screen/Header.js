define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function Header(options) {
    View.apply(this, arguments)
    this.header = new Surface({
        content: options.tpl,
        size: [undefined, 200],
        properties: {
            backgroundColor: 'red'
        }
    })
    this.add(this.header)
    this.header.pipe(this)
}

inherits(Header, View)
module.exports = Header

})

