/* globals define */
define(function(require, exports, module) {
    'use strict'

    var Engine = require('famous/core/Engine')
    var Modifier = require('famous/core/Modifier')
    var Transform = require('famous/core/Transform')
    var ViewSequence = require('famous/core/ViewSequence')
    var Surface = require('famous/core/Surface')
    var EventHandler = require('famous/core/EventHandler')
    var OptionsManager = require('famous/core/OptionsManager')
    var View = require('famous/core/View')
    var RenderNode = require('famous/core/RenderNode')

    var Scrollview = require('famous/views/Scrollview')
    var FlexibleLayout = require('famous/views/FlexibleLayout')
    var EdgeSwapper = require('famous/views/EdgeSwapper')

    var FastClick = require('famous/inputs/FastClick')

    var Utility = require('famous/utilities/Utility')
    var inherits = require('inherits')

    var mainContext = Engine.createContext()

    function App() {
        View.apply(this, arguments)
        this.menu = new Menu()
        this.header = new Header({tpl: this.menu.options.tpl})
        this.content = new Content()
        this.navigation = new View()
        this.scrollview = new Scrollview()
        this.add(this.scrollview)
        var views = [this.header, this.content]
        this.scrollview.sequenceFrom(views)
        views.forEach(function(view) {
            view._eventInput.pipe(this.scrollview)
        }, this)
    }

    inherits(App, View)

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

    function Menu(options) {
        if (!options) options = {}

        OptionsManager.patch(options, Menu.defaults)
        View.call(this, options)
        this.surface = new Surface({
            content: 'Menu',
            size: [undefined, 40],
            properties: {
                backgroundColor: 'yellow',
                top: '160px',
                zIndex: 1,
                classes: ['menu']
            }
        })
        this.add(this.surface)
        this.surface.pipe(this)
    }

    inherits(Menu, View)

    Menu.defaults = {
        tpl: '<div class="menu">saved | discover</div>'
    }

    function Content() {
        View.apply(this, arguments)
        this.surface = new Surface({
            content: 'Content',
            properties: {
                backgroundColor: 'green'
            }
        })
        this.add(this.surface)
        this.surface.pipe(this)
    }

    inherits(Content, View)

    mainContext.add(new App())
})
