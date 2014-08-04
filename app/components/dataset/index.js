'use strict'

var native = 'dataset' in document.documentElement

module.exports = function(elem, key, value) {
    if (!elem || elem.nodeType !== 1 || typeof key != 'string') return value

    // Native access
    if (native) {
        // Getter
        if (value == null) {
            value = elem.dataset[key]
        // Setter
        } else {
            elem.dataset[key] = value
        }
    } else {
        // Borrowed from underscore.string
        key = 'data-' + key.replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase()
        if (value == null) {
            value = elem.getAttribute(key)
        } else {
            elem.setAttribute(key, value)
        }
    }

    return value
}
