'use strict'

var EventHandler = require('famous/core/EventHandler')

/**
 * EventProxy regulates the broadcasting of events based on
 *  a specified proxy function of standard event type: function(type, data).
 *
 * @class EventProxy
 * @constructor
 *
 * @param {function} proxy function to determine whether or not
 *    events are emitted.
 */
function EventProxy(proxy) {
    EventHandler.call(this)
    this._proxy = proxy
    this._emit = EventHandler.prototype.emit.bind(this)
}
EventProxy.prototype = Object.create(EventHandler.prototype)
EventProxy.prototype.constructor = EventProxy

EventProxy.prototype.subscribe = null
EventProxy.prototype.unsubscribe = null

/**
 * If filter proxy is met, trigger an event, sending to all downstream handlers
 *   listening for provided 'type' key.
 *
 * @method emit
 *
 * @param {string} type event type key (for example, 'click')
 * @param {Object} data event data
 * @return {EventHandler} this
 */
EventProxy.prototype.emit = function emit(type, data) {
    this._proxy(type, data, this._emit)
    return this
}

EventProxy.prototype.trigger = EventProxy.prototype.emit

module.exports = EventProxy
