define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var _ = require('underscore')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')

    function Menu() {
        View.apply(this, arguments)

        this.content = document.createDocumentFragment()
        this.indicator = this._createIndicator()
        this.items = this._createItems()
        this.surface = new Surface({
            content: this.content,
            size: this.options.size,
            classes: ['menu']
        })
        this.add(this.surface)
        this.surface.on('click', this._onClick.bind(this))
        this.surface.on('deploy', this._onDeploy.bind(this))
    }

    inherits(Menu, View)
    module.exports = Menu

    Menu.DEFAULT_OPTIONS = {
        size: [undefined, 50],
        items: [
            {title: 'kiiposts', name: 'memos'},
            {title: 'discover', name: 'articles'}
        ],
        selected: 'articles'
    }

    Menu.prototype.select = function(name) {
        if (this.selected && this.selected.name == name) return

        if (this.selected) this.selected.el.classList.remove('selected')
        this.selected = _.findWhere(this.items, {name: name})

        this.selected.el.classList.add('selected')

        // Set indicator position.
        var itemRect = this.selected.el.getBoundingClientRect()
        var indicatorRect = this.indicator.parentNode.getBoundingClientRect()

        this.indicator.style.width = itemRect.width + 'px'
        this.indicator.style.left = itemRect.left - indicatorRect.left + 'px'
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
        var items = {}

        this.options.items.forEach(function(item) {
            item = _.clone(item)
            var el = item.el = document.createElement('span')
            el.className = 'item'
            el.textContent = item.title
            el.setAttribute('data-name', item.name)
            this.content.appendChild(el)
            items[item.name] = item
        }, this)

        return items
    }

    Menu.prototype._onClick = function(e) {
        if (!e.target.classList.contains('item')) return
        var name = e.target.getAttribute('data-name')
        if (this.selected && this.selected.name == name) return
        this._eventOutput.emit('menu:change', {name: name})
    }

    Menu.prototype._onDeploy = function() {
        this.select(this.options.selected)
    }
})



