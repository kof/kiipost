define(function(require, exports, module) {
    'use strict'

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var ContainerSurface = require('famous/surfaces/ContainerSurface')
    var SequentialLayout = require('famous/views/SequentialLayout')
    var Utility = require('famous/utilities/Utility')

    var inherits = require('inherits')

    function Menu() {
        View.apply(this, arguments)

        this.content = document.createDocumentFragment()
        this.indicator = this._createIndicator()
        this.active = this._createItems()

        this.surface = new Surface({
            content: this.content,
            size: this.options.size,
            classes: ['menu']
        })
        this.add(this.surface)
        this.surface.on('click', this._onClick.bind(this))
    }

    inherits(Menu, View)
    module.exports = Menu

    Menu.DEFAULT_OPTIONS = {
        size: [undefined, 50],
        items: [
            {title: 'discover', active: true},
            {title: 'saved'},
            {title: 'check later'}
        ]
    }

    Menu.prototype._createIndicator = function() {
        var container = document.createElement('div')
        container.className = 'indicator'
        var indicator = document.createElement('span')
        container.appendChild(indicator)
        this.content.appendChild(container)
        return indicator
    }

    Menu.prototype._createItems = function() {
        var active
        this.options.items.forEach(function(item) {
            var el = document.createElement('span')
            el.className = 'item'
            el.textContent = item.title
            if (item.active) {
                el.className += ' active'
                active = el
            }
            this.content.appendChild(el)
        }, this)

        return active
    }

    Menu.prototype._setIndicatorPosition = function() {
        var rect = this.active.getBoundingClientRect()
        if (!this._indicatorRect) this._indicatorRect = this.indicator.getBoundingClientRect()
        this.indicator.style.width = rect.width + 'px'
        this.indicator.style.left = rect.left - this._indicatorRect.left + 'px'
    }

    Menu.prototype._onClick = function(e) {
        if (!e.target.classList.contains('item')) return
        this.active.classList.remove('active')
        this.active = e.target
        this.active.classList.add('active')
        this._setIndicatorPosition()
    }
})



