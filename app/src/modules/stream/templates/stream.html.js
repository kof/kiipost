define(function(require, exports, module) {
module.exports = require('multiline')(function() {/*
<div class="scroller invisible topcoat-list">
    <ul class="js-list topcoat-list__container list layer">
        {{#items}}
            <li class="js-list-item topcoat-list__item list-item layer" data-name="item" data-node-id="{{nodeId}}">
                <div class="table fixed">
                    <div class="cell relevance" title="Relevance indicator">
                        <span class="js-relevance-indicator relevance-indicator">
                            <span class="relevance-value" data-name="relevanceValue"></span>
                        </span>
                    </div>
                    <div class="cell image">
                        <span class="img" data-name="image"></span>
                    </div>
                    <div class="cell body truncate"><!-- Class truncate actually just to set nowrap on tags -->
                        <div class="title truncate" data-name="title"></div>
                        <div class="summary" data-name="summary"></div>
                        {{#tags}}<span data-name="tag" class="js-tag tag needsactive" title="Add this tag"></span>{{/tags}}
                        <span class="source truncate" data-name="source">
                            {{#sourceIcon}}<span class="icomatic">{{sourceIcon}}</span>{{/sourceIcon}}
                            <span data-name="source-name"></span>
                        </span>
                        <span class="date" data-name="date"></span>
                    </div>
                </div>
            </li>
        {{/items}}
    </ul>
</div>
*/})
})
