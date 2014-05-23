define(function(require, exports, module) {
'use strict'

var View = require('famous/core/View')
var Scrollview = require('famous/views/Scrollview')
var Utility = require('famous/utilities/Utility')

var inherits = require('inherits')

var context = require('context')

var Header = require('./Header')
var Logo = require('./Logo')
var Avatar = require('./Avatar')
var Menu = require('./Menu')
var Body = require('./Body')

function Screen() {
    View.apply(this, arguments)
    this.scrollview = new Scrollview()
    this.add(this.scrollview)
    this.header = new Header()
    this.logo = new Logo()
    this.avatar = new Avatar()
    var headerHeight = this.header.getSize()[1]
    this.menu = new Menu({headerHeight: headerHeight})
    this.body = new Body({headerHeight: headerHeight})
    var views = [this.header, this.menu, this.avatar, this.logo]
    //this.scrollview.sequenceFrom(views)
    views.forEach(function(view) {
        view._eventInput.pipe(this.scrollview)
    }, this)
    this.header.add(this.menu)
    this.header.add(this.logo)
    this.header.add(this.avatar)
    this.add(this.header)
    this.add(this.body)
    console.log(this.header.getSize())
    this.body._eventInput.on('update', function(data) {
        console.log(data.position)
        this.header.front.setProperties({top: data.offsetY - headerHeight +  'px'})
    }.bind(this))
    context.add(this)
}

inherits(Screen, View)
module.exports = Screen

})
