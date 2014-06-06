define(function(require, exports, module) {
    'use strict'

    var slice = Array.prototype.slice

    /**
     * Create a flat map of elements.
     *
     * @param {Node} container
     * @param {String} [attribute]
     * @return {Object}
     */
    function elementsMap(container, attribute) {
        if (!attribute) attribute = elementsMap.defaults.attribute
        var nodeList = container.querySelectorAll('[' + attribute + ']')
        var map = {}

        if (!nodeList.length) return map

        slice.call(nodeList).forEach(function(el) {
            var attr = el.getAttribute(attribute)

            if (map[attr]) {
                // Its an element, lets make an array
                if (map[attr] instanceof Node) {
                    map[attr] = [map[attr], el]
                // Its an array.
                } else {
                    map[attr].push(el)
                }
            } else {
                map[attr] = el
            }
        })

        return map
    }

    module.exports = elementsMap

    elementsMap.defaults = {
        attribute: 'data-name'
    }

})
