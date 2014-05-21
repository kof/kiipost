/**
 * Find elements, create references cache, access them from the parent container.
 *
 * @author Oleg Slobodskoi 2014
 */
(function(factory) {
    if (typeof define == 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory)
    } else {
        // Browser globals
        factory(jQuery)
    }
})(function($, undefined) {
    'use strict'

    function ElementsMap($element, options) {
        this.$element = $element
        this.options = $.extend({}, ElementsMap.defaults, options)
        this.map = {}
    }

    ElementsMap.defaults = {
        attr: 'data-name'
    }

    ElementsMap.prototype.init = function() {
        var self = this

        this.add(this.$element)
        this.$element.find('*').each(function(i, element) {
            self.add(element)
        })

        return this
    }

    ElementsMap.prototype.add = function(element) {
        var attr = this.options.attr,
            $element = $(element),
            name = $element.attr(attr)

        if (!name) return this

        if (this.map[name]) {
            if (this.map[name] !== $element) this.map[name] = this.map[name].add($element)
        } else {
            this.map[name] = $element
        }

        return this
    }

    ElementsMap.prototype.get = function(element) {
        return this.map
    }

    $.fn.elementsMap = function(options, param) {
        var ret = this

        this.each(function() {
            var $this = $(this),
                inst = $this.data('elementsMap'),
                _ret

            if (!inst) {
                inst = new ElementsMap($this, options)
                inst.init()
                $this.data('elementsMap', inst)
            }

            if (typeof options == 'string') {
                _ret = inst[options](param)
                if (_ret && _ret != inst) ret = _ret
            }
        })

        return ret
    }

    $.fn.elementsMap.ElementsMap = ElementsMap
})
