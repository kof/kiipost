define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var inherits = require('inherits')

var context = require('context')

function Avatar(options) {
    View.apply(this, arguments)

    this.front = new Surface({
        size: this.options.size,
        classes: ['avatar'],
        properties: {
            top: this.options.top + 'px',
            left: context.getSize()[0] - this.options.right - this.options.size[0] + 'px',
            backgroundImage: 'url(' + this.options.avatar + ')'
        }
    })
    this.add(this.front)
    this.front.pipe(this)
}

inherits(Avatar, View)
module.exports = Avatar

Avatar.DEFAULT_OPTIONS = {
    size: [30, 30],
    top: 10,
    right: 10,
    avatar: 'content/images/dummy-avatar.png'
}

Avatar.prototype.setImage = function(url) {
    this.front.setProperties({backgroundImage: 'url(' + url + ')'})
}

})

