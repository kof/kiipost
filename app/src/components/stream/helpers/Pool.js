define(function(require, exports, module) {
    'use strict'

    function Pool() {
        this._pool = []
    }

    module.exports = Pool

    Pool.prototype.setCreator = function(fn) {
        this._creator = fn
    }

    Pool.prototype.get = function() {
        if (this._pool.length) return this._pool.shift()
        return this._creator()
    }

    Pool.prototype.release = function(obj) {
        this._pool.push(obj)
    }
})
