define(function(require, exports, module) {

var $ = require('jquery')
var Backbone = require('backbone')
var _s = require('underscore.string')
var inherits = require('inherits')

function View(options) {
    if (!this.className) this.className = _s.dasherize(this.name) + ' view'
    if (!this.options) this.options = options
    this.elements = {}
    this.views = {}
    this.attached = false
    this._loading = false
    View.apply(this, arguments)
}

inherits(View, Backbone.View)
module.exports = View

View.prototype.show = function() {
    this.attach()
    this.trigger('show')

    return this
}

View.prototype.hide = function() {
    this.detach()
    this.trigger('hide')

    return this
}

View.prototype.attach = function(options) {
    var appendTo,
        parent,
        options1 = options || {},
        options2 = this.options || {}

    this.attached = true

    if (!this.el.parentNode) {
        appendTo = options1.appendTo || options2.appendTo
        parent = options1.parent || options2.parent
        if (!appendTo) appendTo = parent ? parent.el : document.body
        this.$el.appendTo(appendTo)
        if (!options2.silent) this.trigger('attach', options)
    }


    return this
}

View.prototype.detach = function(options) {
    options || (options = {})

    this.attached = false
    this.loading(false)

    if (this.el && this.el.parentNode) {
        this.el.parentNode.removeChild(this.el)
        if (!options.silent) this.trigger('detach', options)
    }

    return this
}

/**
 * Show/hide loading indicator, get the state.
 *
 * We wait before to show loading, because
 * http://ux.stackexchange.com/questions/37416/is-it-bad-ux-to-omit-a-progress-indicator
 *
 * @param {Boolean} [show]
 * @param {Boolean} [immediate] don't wait befor show
 * @return {View|Boolean}
 */
View.prototype.loading = function(show, immediate) {
    if (show == null) return this._loading
    // Make it cheap.
    if (show === this._loading) return this

    this._loading = show
    clearTimeout(this._loadingTimeoutId)

    if (show) {
        this._loadingTimeoutId = setTimeout(function() {
            if (!this._$loading) this._$loading = $('<div class="loading"><span class="rotate layer"/></div>')
            this._$loading.appendTo(this.el)
        }.bind(this), immediate ? 0 : 1000)
    } else if (this._$loading) {
        this._$loading.detach()
    }

    return this
}

})

