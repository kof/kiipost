define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

function Logo(options) {
    View.apply(this, arguments)

    this.front = new Surface({
        size: this.options.size,
        content: 'kiipost',
        classes: ['logo'],
        properties: {
            top: this.options.top + 'px',
            left: this.options.left + 'px'
        }
    })
    this.add(this.front)
    this.front.pipe(this)
}

inherits(Logo, View)
module.exports = Logo

Logo.DEFAULT_OPTIONS = {
    top: 10,
    left: 10,
    size: [70, 40]
}

Logo.prototype.setImage = function(url) {
    this.front.setProperties({backgroundImage: 'url(' + url + ')'})
}

})

