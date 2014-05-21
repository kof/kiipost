define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Scrollview = require('famous/views/Scrollview')
var Utility = require('famous/utilities/Utility')

var inherits = require('inherits')

var context = require('context')

var Menu = require('./Menu')
var Header = require('./Header')
var Content = require('./Content')

function Screen() {
    View.apply(this, arguments)
    this.menu = new Menu()
    this.header = new Header({tpl: this.menu.options.tpl})
    this.content = new Content()
    this.scrollview = new Scrollview()
    this.add(this.scrollview)
    var views = [this.header, this.content]
    this.scrollview.sequenceFrom(views)
    views.forEach(function(view) {
        view._eventInput.pipe(this.scrollview)
    }, this)
    context.add(this)
}

inherits(Screen, View)
module.exports = Screen

})
