
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');

    /**
     * A surface containing a link.
     *   This extends the Surface class.
     *
     * @class AnchorSurface
     *
     * @extends Surface
     * @constructor
     * @param {Object} [options] overrides of default options
     */
    function AnchorSurface(options) {
        this._href = undefined;
        this._content = undefined;
        Surface.apply(this, arguments);
    }

    AnchorSurface.prototype = Object.create(Surface.prototype);
    AnchorSurface.prototype.constructor = AnchorSurface;
    AnchorSurface.prototype.elementType = 'a';
    AnchorSurface.prototype.elementClass = 'famous-surface';

    /**
     * Set content href and text.  This will cause a re-rendering.
     * @method setContent
     * @param {string} content
     */
    AnchorSurface.prototype.setContent = function setContent(content) {
        this._content = content;
        this._contentDirty = true;
    };

    /**
     * Set content href and text.  This will cause a re-rendering.
     * @method setContent
     * @param {string} content
     */
    AnchorSurface.prototype.setHref = function setHref(href) {
        this._href = href;
        this._contentDirty = true;
    };

    /**
     * Place the document element that this component manages into the document.
     *
     * @private
     * @method deploy
     * @param {Node} target document parent of this container
     */
    AnchorSurface.prototype.deploy = function deploy(target) {
        target.href = this._href || '';
        target.innerHTML = this._content || '';
    };

    /**
     * Remove this component and contained content from the document
     *
     * @private
     * @method recall
     *
     * @param {Node} target node to which the component was deployed
     */
    AnchorSurface.prototype.recall = function recall(target) {
        target.href = '';
        target.innerHTML = '';
    };

    module.exports = AnchorSurface;
});
