require('api/setup')

var m = require('mongoose')
var co = require('co')

var db = require('api/db')
var sync = require('../../sync')

db.init()
    .then(function() {
        co(function *(){
            var errors
            console.time('sync')
            try {
                errors = yield sync({
                    /*
                    query: {feed: {$in: ['http://techcrunch.com/fundings-exits/feed/',
                        'http://techcrunch.com/europe/feed/',
                        'http://news.blogs.cnn.com/feed/',
                        'http://www.forbes.com/real-time/feed2/']}},*/
                    //feed: 'http://feeds.aps.org/rss/recent/pra.xml',
                    //feed: 'http://cal.tamu.edu/?&format=rss',
                    //feed: 'http://www.theverge.com/rss/frontpage',
                    //feed: 'http://thepioneerwoman.com/contact/feed/',
                    feed: 'http://feeds.feedburner.com/MajorNelsonblogcast',
                    verbose: true,
                    //limit: 3000,
                    //skip: 3000,
                    update: true
                })
            } catch(err) {
                console.log(err)
                console.log(err.stack)
            }
            console.timeEnd('sync')
            errors.forEach(function(err) {
                console.log(err)
                console.log(err.stack)
            })
            process.exit()
        })()
    })
    .catch(function(err) {
        console.log(err.stack)
    })
