test('extract 1', function() {
    stop()

    var title = 'Interview With Mark Zuckerberg At Web 2.0 Summit (VIDEO)'
    var score = 41
    var url = 'http://techcrunch.com/2010/11/18/mark-zuckerberg/'
    var icon = 'http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/homescreen_TCIcon_ipad_2x.png?m=1391183173g'
    var images = []
    var description = '<iframe src="http://www.youtube.com/embed/Czw-dtTP6oU?version=3&rel=1&fs=1&showsearch=0&showinfo=1&iv_load_policy=1&wmode=transparent"></iframe> <p>This is seriously the best Mark Zuckerberg interview I’ve ever seen. Fresh off of the <a href="http://techcrunch.com/2010/11/15/facebook-messaging/">announcement of Facebook Messages</a> (yes, that’s what the product is called) Facebook CEO Zuckerberg took the stage at Web 2.0 Summit to talk about the state of Facebook.</p> <p>Zuckerberg went into the recent scuffles with Google, how soon every major product will be rethought to be social, why Facebook’s been on a recent acquisition tear and more. But the most insightful part of the interview was when Zuckerberg <a href="http://techcrunch.com/2010/11/16/mark-zuckerberg-your-map-is-missing-uncharted-territory/">called out</a> John Battelle and Tim O’Reilly on the inaccuracy of their Web 2.0 <a href="http://techcrunch.com/2010/10/13/web-2-0-acquisitions-the-game/">“Points of Control”</a> map.</p> <blockquote><p><em>“Your map is wrong. The biggest part of the map has to be uncharted territory — this map makes it seem like it’s zero-sum, but it’s not. We’re building value, not just taking it away from someone else.”</em></p></blockquote> <p>Sometimes amidst all the competition, it’s difficult to remember why we got into the game in the first place.</p>'
    var summary = 'This is seriously the best Mark Zuckerberg interview I’ve ever seen. Fresh off of the announcement of Facebook Messages (yes, that’s what the product is called) Zuckerberg took the stage at Web 2.0 Summit to talk about the state of Facebook'
    var tags = [ 'facebook', 'mark zuckerberg' ]

    extractor.extract('http://techcrunch.com/2010/11/18/mark-zuckerberg/')(function(err, data) {
        equal(err, null, 'no errors')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.url, url, 'url ok')
        equal(data.icon, icon, 'icon ok')
        deepEqual(data.images, images, 'images ok')
        equal(data.description, description, 'description ok')
        equal(data.summary, summary, 'summary ok')
        deepEqual(data.tags, tags, 'tags ok')
        start()
    })
})

test('extract 2', function() {
    stop()

    var title = 'Interview with Jan Lehnardt of Hoodie'
    var score = 300
    var url = 'http://appbusinesspodcast.com/jan-lehnardt-hoodie/'
    var icon = 'http://appbusinesspodcast.com/wp-content/uploads/2014/05/favico2.png'
    var images = []
    var description = '<div><audio> <source src="http://appbusinesspodcast.com/podlove/file/876/s/webplayer/c/episode/ABP041-Jan-Lehnardt-CEO-of-Hoodie.m4a"></source> <source src="http://appbusinesspodcast.com/podlove/file/875/s/webplayer/c/episode/ABP041-Jan-Lehnardt-CEO-of-Hoodie.mp3"></source> </audio> <h3>On this episode, David is joined by Jan Lehnardt of Hood.ie. Jan shares his thoughts on the recent Apple release CloudKit and what makes it similar and different to Hood.ie. Listen in as we discuss:</h3> <ul> <li>What the term backend is all about and why developers need a backend strategy</li> <li>Jan’s “abundance mindset” and why he’s not worried about CloudKit at all</li> <li>Comparison of CloudKit and Hoodie – what interested developers need to know</li> <li>More about the Hoodie Project</li> <li>Comparison of Parse and Hoodie</li> </ul> <p></p> <h3>Sponsors:</h3> <ul> <li><strong><a href="http://affordabledev.com">Affordable Dev</a></strong> a complete mobile development agency with developers and designers that will bring your project to life. Mention the #ABP for 20% off of your next project. For a limited time – Affordable Dev is offering free ASO consultations with an ASO professional with every new project.</li> </ul> <h3>Resources and Links Mentioned in this Episode</h3> <h3>Listening Options</h3> <p>Download your favorite file format: </p> <h3>Transcription:</h3> <p></p> <p></p> </div>'
    var summary = 'David is joined by Jan Lehnardt of Hood.ie. Jan shares his thoughts on the recent Apple release CloudKit and what makes it similar and different to Hood.ie.'
    var tags = [
            'backend',
            'cloudkit',
            'frontend',
            'hood.ie',
            'hoodie',
            'jan lehnardt'
        ]

    extractor.extract('http://appbusinesspodcast.com/jan-lehnardt-hoodie/')(function(err, data) {
        equal(err, null, 'no errors')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.summary, summary, 'summary ok')
        equal(data.url, url, 'url ok')
        equal(data.icon, icon, 'icon ok')
        deepEqual(data.images, images, 'images ok')
        equal(data.description, description, 'description ok')
        deepEqual(data.tags, tags, 'tags ok')
        start()
    })
})

test('extract 3', function() {
    stop()

    var title = "Project Loon: Google's quest to bring internet to the world with a fleet of balloons"
    var score = 309
    var description = "<div> <p>For many, internet access is a vital resource. However, vast, rural swaths of the world have no broadband internet access. One of Google's latest \"moonshot\" projects seeks to fill that gap with balloons. Called Project Loon, the plan is incredibly ambitious: it calls for a large network of \"towers\" in the sky that receive internet access from antennas on the ground in one location and beam internet down to rural homes below. Google has many challenges to overcome before Loon becomes a reality, but the team says it hopes to have a functioning service online by summer 2015. We'll be covering the company's progress here — stay tuned for all the updates. </p> </div>"
    var url = 'http://www.theverge.com/2014/6/22/5831836/google-project-loon-storystream'
    var icon = 'http://www.theverge.com/images/verge/apple-touch-icon.png'
    var images = []
    var summary = "For many, internet access is a vital resource. However, vast, rural swaths of the world have no broadband internet access. One of Google's latest \"moonshot\" projects seeks to fill that gap with..."
    var tags = [ 'general', 'the-verge' ]

    extractor.extract('http://www.theverge.com/2014/6/22/5831836/google-project-loon-storystream')(function(err, data) {
        equal(err, null, 'no errors')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.summary, summary, 'summary ok')
        equal(data.url, url, 'url ok')
        equal(data.icon, icon, 'icon ok')
        deepEqual(data.images, images, 'images ok')
        equal(data.description, description, 'description ok')
        deepEqual(data.tags, tags, 'tags ok')
        start()
    })
})

test('extract 4', function() {
    stop()

    var url = 'http://thepioneerwoman.com/blog/2014/06/saturday-gathering/'

    // We can't parse it correctly, just verifying it doesn't breaks.
    extractor.extract('http://thepioneerwoman.com/blog/2014/06/saturday-gathering/')(function(err, data) {
        equal(err, null, 'no errors')
        equal(data.url, url, 'url ok')
        start()
    })
})

