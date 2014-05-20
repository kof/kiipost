/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Scrollview = require("famous/views/Scrollview");
    var View = require('famous/core/View');
    var ViewSequence = require('famous/core/ViewSequence');
    var Surface = require('famous/core/Surface');
    var EventHandler = require('famous/core/EventHandler');
    var OptionsManager = require('famous/core/OptionsManager');
    var FlexibleLayout = require('famous/views/FlexibleLayout');

    var mainContext = Engine.createContext()

    function App() {
        View.apply(this, arguments)
        this.header = new Header()
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

    App.prototype = Object.create(View.prototype)

    function Header() {
        View.apply(this, arguments)
        this.surface = new Surface({
            content: 'Header',
            size: [undefined, 200],
            properties: {
                backgroundColor: 'red'
            }
        })
        this.add(this.surface)
        this.surface.pipe(this)
    }

    Header.prototype = Object.create(View.prototype)

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

    Content.prototype = Object.create(View.prototype)

    mainContext.add(new App());
})
