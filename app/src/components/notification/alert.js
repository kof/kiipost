define(function(require, exports, module) {
    'use strict'

    var noop = function() {}

    /**
     * Alert using cordova notification plugin if installed, otherwise
     * fallback to alert.
     */
    module.exports = function(message, callback, title, buttonName) {
        if (navigator.notification){
            if (typeof callback == 'string') {
                buttonName = title
                title = callback
                callback = noop
            }
            navigator.notification.alert(message, callback, title, buttonName)
        } else {
            alert(message)
        }
    }
})
