define(function(require, exports, module) {

var Infinite = require('iscroll/iscroll-infinite')

// XXX IScroll needs a better build.
Infinite = window.IScroll

module.exports = function(el, options) {
    options || (options = {})
    options.disableTouch != null || (options.disableTouch = !IScroll.utils.hasTouch)
    options.mouseWheel != null || (options.mouseWheel = !IScroll.utils.hasTouch)
    options.disableMouse != null || (options.disableMouse = !IScroll.utils.hasTouch)
    options.scrollbars != null || (options.scrollbars = 'custom')
    options.fadeScrollbars != null || (options.fadeScrollbars = true)
    options.interactiveScrollbars != null || (options.interactiveScrollbars = true)
    if (options.infiniteElements) return new Infinite(el, options)
    return new IScroll(el, options)
}

var refresh = Infinite.prototype.refresh

Infinite.prototype.refresh = function(options) {
    if (options && options.resize) {
        this.infiniteElementHeight = this.infiniteMaster.offsetHeight
        this.infiniteHeight = this.infiniteLength * this.infiniteElementHeight
    }

    return refresh.call(this)
}

})
