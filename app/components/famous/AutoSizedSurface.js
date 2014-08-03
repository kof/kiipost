define(function(require, exports, module) {
    'use strict'

    var Surface = require('famous/core/Surface')
    var Engine = require('famous/core/Engine')

    function AutoSizedSurface() {
        Surface.apply(this, arguments)
        this.on('deploy', this._onDeploy.bind(this))
    }

    AutoSizedSurface.prototype = Object.create(Surface.prototype)
    AutoSizedSurface.prototype.constructor = AutoSizedSurface
    module.exports = AutoSizedSurface

    AutoSizedSurface.prototype._onDeploy = function() {
        Engine.nextTick(this._detectSize.bind(this))
    }

    AutoSizedSurface.prototype._detectSize = function() {
        var size = this.getSize()
        var width = size[0] === true ? this._currTarget.offsetWidth : size[0]
        var height = size[1] === true ? this._currTarget.offsetHeight : size[1]
        this.setSize([width, height])
    }
})
