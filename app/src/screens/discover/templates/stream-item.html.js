define(function(require, exports, module) {
module.exports = require('multiline')(function() {/*
<div class="text">
    <h1>{{title}}</h1>
    <p>{{summary}}</p>
    <a href="{{website}}" target="kiipost-article" class="truncate">{{website}}</a>
</div>
{{#image}}
    <div class="image {{#image.icon}}icon{{/image.icon}} {{#image.small}}small{{/image.small}}" style="background-image: url('{{image.url}}')"></div>
{{/image}}
*/})
})

