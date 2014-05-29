define(function(require, exports, module) {
module.exports = require('multiline')(function() {/*
<div class="text" {{#width}}style="width: {{width}}px"{{/width}}>
    <h1>{{title}}</h1>
    <p>{{summary}}</p>
    <a href="{{website}}" target="kiipost-article" class="truncate">{{website}}</a>
</div>
{{#image}}
    <div class="image {{#image.icon}}icon{{/image.icon}} {{#image.small}}small{{/image.small}}"
        style="background-image: url('{{image.url}}'); width: {{image.width}}px;"
    ></div>
{{/image}}
*/})
})

