'use strict'

/**
 * Prompt using cordova notification plugin if installed, otherwise
 * fallback to window.prompt.
 */
module.exports = function(message, callback, title, buttonNames, defaultText) {
    if (navigator.notification){
        navigator.notification.prompt.apply(navigator.notification, arguments)
    } else {
        var input = prompt(message, defaultText) || ''
        callback({
            buttonIndex: input ? 1 : 2,
            input1: input
        })
    }
}
