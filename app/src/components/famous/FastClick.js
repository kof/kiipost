/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Fixed https://github.com/Famous/famous/issues/109
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    /**
     * FastClick is an override shim which maps event pairs of
     *   'touchstart' and 'touchend' which differ by less than a certain
     *   threshold to the 'click' event.
     *   This is used to speed up clicks on some browsers.
     */
    if (!window.CustomEvent || !('ontouchstart' in window)) return;
    var clickThreshold = 300;
    var clickWindow = 500;
    var positionThreshold = 3;
    var potentialClicks = {};
    var recentlyDispatched = {};
    var _now = Date.now;

    window.addEventListener('touchstart', function(event) {
        var timestamp = _now();
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            potentialClicks[touch.identifier] = timestamp;
        }
    });

    window.addEventListener('touchmove', function(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            delete potentialClicks[touch.identifier];
        }
    });

    window.addEventListener('touchend', function(event) {
        var currTime = _now();
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var startTime = potentialClicks[touch.identifier];
            if (startTime && currTime - startTime < clickThreshold) {
                var clickEvt = new window.CustomEvent('click', {
                    bubbles: true,
                    detail: touch
                });
                recentlyDispatched[currTime] = clickEvt;
                event.target.dispatchEvent(clickEvt);
            }
            delete potentialClicks[touch.identifier];
        }
    });

    window.addEventListener('click', function(event) {
        var currTime = _now();
        for (var i in recentlyDispatched) {
            var previousEvent = recentlyDispatched[i];
            if (currTime - i < clickWindow) {
                if (event instanceof window.MouseEvent && _sameTarget(event, previousEvent)) {
                    event.stopPropagation();
                }
            }
            else delete recentlyDispatched[i];
        }
    }, true);

    function _sameTarget(event, previousEvent) {
        if (event.target === previousEvent.target) return true;

        if (previousEvent.screenX != null && previousEvent.screenY != null) {
            var detail = previousEvent;
        } else {
            var detail = previousEvent.detail;
        }

        if (detail &&
            Math.abs(detail.screenX - event.screenX) < positionThreshold &&
            Math.abs(detail.screenY - event.screenY) < positionThreshold) {
            return true;
        }

        return false;
    }
});
