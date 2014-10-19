'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')
var RenderController = require('famous/views/RenderController')
var ContainerSurface = require('famous/surfaces/ContainerSurface')
var Transitionable  = require('famous/transitions/Transitionable')
var GenericSync     = require('famous/inputs/GenericSync')
var MouseSync       = require('famous/inputs/MouseSync')
var TouchSync       = require('famous/inputs/TouchSync')

GenericSync.register({mouse: MouseSync, touch: TouchSync})

function Menu() {
    View.apply(this, arguments)
    this.closed = this.options.closed
    this.initialize()
}
inherits(Menu, View)
module.exports = Menu

Menu.DEFAULT_OPTIONS = {
    velocityThreshold: 0.75,
    closed: true,
    context: null,
    container: {
        width: 0.8,
        closedShift: 0.3
    },
    transition: {
        duration: 300,
        curve: 'easeOut'
    },
    item: {
        height: 45,
        level0: {
            opacity: 0.25
        },
        level1: {
            opacity: 0.75
        }
    },
    menuZ: -2,
    mainZ: 5,
    items: [
        {
            name: 'menu',
            title: 'MENU',
            items: [
                {
                    name: 'home',
                    title: 'Home'
                },
                {
                    name: 'signOut',
                    title: 'Sign out'
                }
            ]
        }
    ]
}

Menu.prototype.initialize = function() {
    var o = this.options
    var size = o.context.getSize()

    this.controller = new RenderController({
        inTransition: false,
        outTransition: false
    })
    o.context.add(this.controller)

    this.container = new ContainerSurface({
        classes: ['menu'],
        size: [size[0] * o.container.width, undefined]
    })

    this._menuOpenedPosition = 0
    this._menuClosedPosition = -o.container.closedShift * this.container.getSize()[0]
    this._menuPosition = new Transitionable(this.closed ? this._menuClosedPosition : this._menuOpenedPosition)
    this._menuPositionThreshold = this._menuClosedPosition / 2

    this._mainClosedPosition = size[0] + this._menuClosedPosition
    this._mainOpenedPosition = 0
    this._mainPosition = new Transitionable(this.closed ? this._mainOpenedPosition : this._mainClosedPosition)

    this.menuModifier = new Modifier({
        transform: function() {
            return Transform.translate(this._menuPosition.get(), 0, o.menuZ)
        }.bind(this)
    })
    this.add(this.menuModifier).add(this.container)

    this.back = new Surface({
        classes: ['back']
    })
    this.back.on('click', this.close.bind(this))
    this.add(new Modifier({
        transform: Transform.translate(0, 0, o.backZ)
    })).add(this.back)

    var itemY = 0
    ;(function addAll(items, level) {
        _(items).each(function(item) {
            var surface = new Surface({
                content: item.title,
                classes: ['item', 'level-' + level],
                size: [undefined, o.item.height]
            })
            surface.on('click', this._onItem.bind(this, item))

            this.container.add(new Modifier({
                transform: Transform.translate(0, itemY, 0),
                opacity: o.item['level' + level].opacity
            })).add(surface)

            itemY += o.item.height

            if (item.items) addAll.call(this, item.items, ++level)
        }, this)
    }.call(this, o.items, 0))

    this._handleSwipe()
}

Menu.prototype.setMainModifier = function(modifier) {
    modifier.transformFrom(function() {
        return Transform.translate(this._mainPosition.get(), 0)
    }.bind(this))

    return this
}

Menu.prototype.open = function() {
    this.controller.show(this)
    this._menuPosition.set(this._menuOpenedPosition, this.options.transition, function() {
        this.closed = false
    }.bind(this))
    this._mainPosition.set(this._mainClosedPosition, this.options.transition)
}

Menu.prototype.close = function() {
    this._menuPosition.set(this._menuClosedPosition, this.options.transition, function() {
        this.controller.hide()
        this.closed = false
    }.bind(this))
}

Menu.prototype._handleSwipe = function() {
    this.sync = new GenericSync(
        ['mouse', 'touch'],
        {direction : GenericSync.DIRECTION_X}
    )

    this.back.pipe(this.sync)

    this.sync.on('update', function(data) {
        var menuPos = this._menuPosition.get() + data.delta
        if (this._isWithin(menuPos, this._menuOpenedPosition, this._menuClosedPosition)) {
            this._menuPosition.set(menuPos)
        }
        var mainPos = this._mainPosition.get() + data.delta
        if (this._isWithin(mainPos, this._mainOpenedPosition, this._mainClosedPosition)) {
            this._mainPosition.set(mainPos)
        }
    }.bind(this))

    this.sync.on('end', function(data) {
        var velocity = data.velocity
        var pos = this._menuPosition.get()
        var velThreshold = this.options.velocityThreshold

        if (pos > this._menuPositionThreshold) {
            if (velocity < -velThreshold) this.close()
            else this.open()
        } else {
            if (velocity > velThreshold) this.open()
            else this.close()
        }
    }.bind(this));
}

Menu.prototype._onItem = function(e, item) {
    console.log('item', item)
}

Menu.prototype._isWithin = function(val, min, max) {
    if (min > max) {
        var _min = min
        min = max
        max = _min
    }
    return val <= max && val >= min
}
