define(function(require, exportsm, module) {
    var server = require('test/server')

    module.exports = function() {
        var article

        article = {
            "title": "AppGyver Launches Composer, A Drag-And-Drop Tool For Building HTML5 Apps",
            "summary": "&nbsp;Until now, AppGyver was mostly known for its app prototyping tools and Steroid.js, a command-line based tool for quickly building HTML5 apps. Today, the company is bringing both of these ideas together with the public beta launch of Composer, a",
            "date": "2014-05-22T17:49:01.000Z",
            "link": "http://techcrunch.com/2014/05/22/appgyver-launches-composer-a-drag-and-drop-tool-for-building-html5-apps/?ncid=rss",
            "website": "http://techcrunch.com",
            "icon": "http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/homescreen_TCIcon_ipad_2x.png?m=1391183173g",
            "_id": "537ea987e8122b0200005130",
            "image": {
                "url": "http://tctechcrunch2011.files.wordpress.com/2014/05/html5_mug.jpg?w=210&h=158&crop=1"
            },
            "tags": ["html5", "developer", "tc", "appgyver", "appbuilder", "prototypingtools", "commandline"],
            "relevance": 74
        }

        server.respondWith('GET', /\/api\/article/, [
            200, {'Content-Type':'application/json'},
            JSON.stringify(article)
        ])
    }
})
