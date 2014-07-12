require('api/setup')

var m = require('mongoose')
var co = require('co')

var db = require('api/db')
var sync = require('../../sync')

db.init()
    .then(function() {
        co(function *(){
            var stats
            console.time('sync')
            try {
                stats = yield sync({
                    /*
                    query: {feed: {$in: ['http://techcrunch.com/fundings-exits/feed/',
                        'http://techcrunch.com/europe/feed/',
                        'http://news.blogs.cnn.com/feed/',
                        'http://www.forbes.com/real-time/feed2/']}},*/
                    //feed: 'http://feeds.aps.org/rss/recent/pra.xml',
                    //feed: 'http://cal.tamu.edu/?&format=rss',
                    //feed: 'http://www.theverge.com/rss/frontpage',
                    //feed: 'http://thepioneerwoman.com/contact/feed/',
                    //feed: 'http://feeds.feedburner.com/MajorNelsonblogcast',
                    //feed: 'http://i.rottentomatoes.com/syndication/rss/top_news.xml',
                    feed: 'http://www.defenselink.mil/news/mrss_leadphotos.xml',
                    verbose: true,
                    limit: 300,
                    //skip: 3000,
                    update: true
                })
            } catch(err) {
                console.log(err)
                console.log(err.stack)
            }
            console.timeEnd('sync')
            stats.errors.forEach(function(err) {
                console.log(err)
                console.log(err.stack)
            })
            process.exit()
        })()
    })
    .catch(function(err) {
        console.log(err.stack)
    })
