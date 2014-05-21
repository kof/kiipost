define(function(require, exports, module) {
module.exports = require('multiline')(function() {/*

<div class="content topcoat-list">
    <div class="js-nothing-found nothing-found table hidden">
        <div class="cell">
            <h2>Nothing found</h2>
            <p>You might want to <a href="" class="js-show-tags-editor">Follow tags</a> or change <a href="" class="js-show-settings">Settings</a>.</p>
        </div>
    </div>
    <div class="js-scroller scroller invisible">
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
</div>

*/})
})
