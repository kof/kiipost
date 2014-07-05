test('extract 1', function() {
    stop()

    var title = 'Interview With Mark Zuckerberg At Web 2.0 Summit (VIDEO)'
    var score = 41
    var url = 'http://techcrunch.com/2010/11/18/mark-zuckerberg/'
    var icon = 'http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/homescreen_TCIcon_ipad_2x.png?m=1391183173g'
    var images = [ {
        url: 'http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/techcrunch.global.thumb-placeholder.png?m=1391183173g',
        width: 0,
        height: 0
    } ]
    var description = '<p><iframe src="http://www.youtube.com/embed/Czw-dtTP6oU?version=3&rel=1&fs=1&showsearch=0&showinfo=1&iv_load_policy=1&wmode=transparent"></iframe> </p> <p>This is seriously the best Mark Zuckerberg interview I’ve ever seen. Fresh off of the <a href="http://techcrunch.com/2010/11/15/facebook-messaging/">announcement of Facebook Messages</a> (yes, that’s what the product is called) Facebook CEO Zuckerberg took the stage at Web 2.0 Summit to talk about the state of Facebook.</p> <p>Zuckerberg went into the recent scuffles with Google, how soon every major product will be rethought to be social, why Facebook’s been on a recent acquisition tear and more. But the most insightful part of the interview was when Zuckerberg <a href="http://techcrunch.com/2010/11/16/mark-zuckerberg-your-map-is-missing-uncharted-territory/">called out</a> John Battelle and Tim O’Reilly on the inaccuracy of their Web 2.0 <a href="http://techcrunch.com/2010/10/13/web-2-0-acquisitions-the-game/">“Points of Control”</a> map.</p> <blockquote><p><em>“Your map is wrong. The biggest part of the map has to be uncharted territory — this map makes it seem like it’s zero-sum, but it’s not. We’re building value, not just taking it away from someone else.”</em></p></blockquote> <p>Sometimes amidst all the competition, it’s difficult to remember why we got into the game in the first place.</p>'
    var summary = 'This is seriously the best Mark Zuckerberg interview I’ve ever seen. Fresh off of the announcement of Facebook Messages (yes, that’s what the product is called) Zuckerberg took the stage at Web 2.0 Summit to talk about the state of Facebook'
    var tags = [ 'facebook', 'mark zuckerberg' ]

    extractor.extract(url, function(err, data) {
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
    var images = [
      { url: 'http://appbusinesspodcast.com/wp-content/uploads/2014/05/FacebookGroupButton-inactive.png',
        width: 300,
        height: 100 },
      { url: 'http://appbusinesspodcast.com/wp-content/uploads/2014/07/Ad14.png',
        width: 300,
        height: 200 },
      { url: 'http://appbusinesspodcast.com/wp-content/uploads/2014/07/Ad300x250.png',
        width: 300,
        height: 250 },
      { url: 'http://appbusinesspodcast.com/wp-content/uploads/2014/01/appicon2.png',
        width: 260,
        height: 227 },
      { url: 'http://appbusinesspodcast.com/wp-content/uploads/2014/06/ABP041-image.jpg',
        width: 0,
        height: 0 }
    ]
    var description = '<div><audio> <source src="http://appbusinesspodcast.com/podlove/file/876/s/webplayer/c/episode/ABP041-Jan-Lehnardt-CEO-of-Hoodie.m4a"></source> <source src="http://appbusinesspodcast.com/podlove/file/875/s/webplayer/c/episode/ABP041-Jan-Lehnardt-CEO-of-Hoodie.mp3"></source> </audio> <h3>On this episode, David is joined by Jan Lehnardt of Hood.ie. Jan shares his thoughts on the recent Apple release CloudKit and what makes it similar and different to Hood.ie. Listen in as we discuss:</h3> <ul> <li>What the term backend is all about and why developers need a backend strategy</li> <li>Jan’s “abundance mindset” and why he’s not worried about CloudKit at all</li> <li>Comparison of CloudKit and Hoodie – what interested developers need to know</li> <li>More about the Hoodie Project</li> <li>Comparison of Parse and Hoodie</li> </ul> <p></p> <h3>Sponsors:</h3> <ul> <li><strong><a href="http://affordabledev.com">Affordable Dev</a></strong> a complete mobile development agency with developers and designers that will bring your project to life. Mention the #ABP for 20% off of your next project. For a limited time – Affordable Dev is offering free ASO consultations with an ASO professional with every new project.</li> </ul> <h3>Resources and Links Mentioned in this Episode</h3> <h3>Listening Options</h3> <p>Download your favorite file format: </p> <h3>Transcription:</h3> <p></p> <p></p> </div><p></p>'
    var summary = 'David is joined by Jan Lehnardt of Hood.ie. Jan shares his thoughts on the recent Apple release CloudKit and what makes it similar and different to Hood.ie.'
    var tags = [
            'backend',
            'cloudkit',
            'frontend',
            'hood.ie',
            'hoodie',
            'jan lehnardt'
        ]

    extractor.extract(url, function(err, data) {
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
    var summary = "For many, internet access is a vital resource. However, vast, rural swaths of the world have no broadband internet access. One of Google's latest \"moonshot\" projects seeks to fill that gap with..."
    var tags = [ 'general', 'the-verge' ]

    extractor.extract(url, function(err, data) {
        equal(err, null, 'no errors')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.summary, summary, 'summary ok')
        equal(data.url, url, 'url ok')
        equal(data.icon, icon, 'icon ok')
        // This one has dynamic url
        equal(typeof data.images[0].url, 'string', 'images ok')
        equal(data.description, description, 'description ok')
        deepEqual(data.tags, tags, 'tags ok')
        start()
    })
})

test('extract 4', function() {
    stop()

    var url = 'http://thepioneerwoman.com/blog/2014/06/saturday-gathering/'
    var score = 94
    var title = 'Saturday Gathering | Confessions of a Pioneer Woman'
    var summary = 'My two girls, my BFF Hyacinth, Hy\'s daughter, and I are in New York City for a few days, and I\'ll be taking photos and sharin...'
    var description = '<p><a href="https://www.flickr.com/photos/pioneerwoman/14474622972" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3836/14474622972_355d20a505_z.jpg" alt="Saturday Gathering"></img></a>My two girls, my BFF Hyacinth, Hy’s daughter, and I are in New York City for a few days, and I’ll be taking photos and sharing our adventures while I’m here. First, though, I wanted to post some photos of the crew gathering cattle Saturday morning. Marlboro Man needed to work some of his calves, but since it was Saturday, we all got to sleep in a little bit! </p> <p>Until 5:00 am. </p> <p>Ah, summertime on the ranch. It’s such a…unique time.</p> <p>Ahem.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289345188" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2914/14289345188_1c4d0180da_z.jpg" alt="Saturday Gathering"></img></a>My brother-in-law Tim and his boy came to help.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14472559931" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3872/14472559931_fc953ca7a4_z.jpg" alt="Saturday Gathering"></img></a>The dogs came to help, too! They were so excited that the guys were gathering cattle so close to our house so they could tag along. </p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14496060763" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3888/14496060763_3e82b8fe0f_z.jpg" alt="Saturday Gathering"></img></a>Marlboro Man and Tim work so well together. I love watching them. After forty years, they can pretty much read each other’s minds.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14452829726" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2897/14452829726_ef8d305836_z.jpg" alt="Saturday Gathering"></img></a>Part of the crew was a couple of pastures away, gathering another bunch of cattle. Meanwhile, this pasture went pretty smoothly!</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289312890" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2921/14289312890_5f51e6173a_z.jpg" alt="Saturday Gathering"></img></a>Oh, sure—a couple of cows tried to make a break for it.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474733174" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2925/14474733174_05d0165f0c_z.jpg" alt="Saturday Gathering"></img></a>Cowboy Tim and my older boy got this one back in.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474733374" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2909/14474733374_5c1cd92ec6_z.jpg" alt="Saturday Gathering"></img></a>(The dogs think they helped, of course.)</p> <p>(We’ll just let them go ahead and think that. It’s confidence-building!)</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14496058013" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5560/14496058013_995b04879d_z.jpg" alt="Saturday Gathering"></img></a>My brother-in-law went after this one!</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474732554" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5471/14474732554_1bd079e5bd_z.jpg" alt="Saturday Gathering"></img></a>And got her back, no problem at all.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14452827846" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3886/14452827846_fec4d7f402_z.jpg" alt="Saturday Gathering"></img></a>Once they were all gathered up…</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289311060" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3890/14289311060_b323f819d7_z.jpg" alt="Saturday Gathering"></img></a>The guys needed to move them through a gate and take them on up to the pens by our house.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289340698" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5573/14289340698_4d4defee4d_z.jpg" alt="Saturday Gathering"></img></a>My baby was equal to the task. He was alive, awake, alert, and enthusiastic! </p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14475924525" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2913/14475924525_892443603d_z.jpg" alt="Saturday Gathering"></img></a>(Well…alive and awake, anyway.)</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474725004" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5593/14474725004_217b673260_z.jpg" alt="Saturday Gathering"></img></a>That’s our house up there on the hill. And our family cemetery down below.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474616532" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5536/14474616532_27b4e34bef_z.jpg" alt="Saturday Gathering"></img></a>And there’s my brother-in-law Tim…</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289289019" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3878/14289289019_df3c595fe3_z.jpg" alt="Saturday Gathering"></img></a>And my impossibly-grown-up nephew. </p> <p><em>When did he get to be so old?</em></p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/2101347540" title="Untitled by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2347/2101347540_de8fab5a21_z.jpg" alt="Untitled"></img></a>Awww. I can’t handle the passage of time.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474729374" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5582/14474729374_86e1999202_z.jpg" alt="Saturday Gathering"></img></a>Meanwhile, the dogs trudged along in the tall grass…</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474729104" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2936/14474729104_0dc7507652_z.jpg" alt="Saturday Gathering"></img></a>And got soaked not from a dip in the creek, but by the morning dew. </p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14496054133" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm6.staticflickr.com/5511/14496054133_a9c7d6052b_z.jpg" alt="Saturday Gathering"></img></a>Good morning, Hooker!</p> <p>Look at that face. Canine preciousness. </p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14475922435" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3905/14475922435_1e67cdb917_z.jpg" alt="Saturday Gathering"></img></a>Most of the cattle cooperated…</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14452823826" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3849/14452823826_4c57c0f5ed_z.jpg" alt="Saturday Gathering"></img></a>And made it through the gate just fine.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14472552281" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm3.staticflickr.com/2896/14472552281_b81ccdb0e9_z.jpg" alt="Saturday Gathering"></img></a>But a couple of the calves were so wittle that they couldn’t quite keep up.</p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14474612822" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3883/14474612822_fd20c20e5e_z.jpg" alt="Saturday Gathering"></img></a>So Tim and his boy loaded ‘em in the back of my pickup and I gave ‘em a ride to the pens!</p> <p>Cutest hitchhiker ever. </p> <p></p><p> <a href="https://www.flickr.com/photos/pioneerwoman/14289334068" title="Saturday Gathering by Ree Drummond, on Flickr"><img src="https://farm4.staticflickr.com/3899/14289334068_487ec4798d_z.jpg" alt="Saturday Gathering"></img></a>All the while, my father-in-law (who’d brought along his good friend Stormy) watched from his pickup. </p> <p>I don’t think he stopped smiling the whole time. </p>'
    var images = [
        { url: 'https://farm4.staticflickr.com/3836/14474622972_355d20a505_z.jpg',
           width: 630,
           height: 419 },
         { url: 'https://farm3.staticflickr.com/2914/14289345188_1c4d0180da_z.jpg',
           width: 630,
           height: 419 },
         { url: 'https://farm4.staticflickr.com/3872/14472559931_fc953ca7a4_z.jpg',
           width: 630,
           height: 419 },
         { url: 'https://farm4.staticflickr.com/3888/14496060763_3e82b8fe0f_z.jpg',
           width: 630,
           height: 419 },
         { url: 'https://farm3.staticflickr.com/2897/14452829726_ef8d305836_z.jpg',
           width: 630,
           height: 419 }
    ]

    // Sends gziped data independent of req headers.
    extractor.extract(url, function(err, data) {
        equal(err, null, 'no errors')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.summary, summary, 'summary ok')
        equal(data.url, url, 'url ok')
        deepEqual(data.images, images, 'images ok')
        equal(data.description, description, 'description ok')
        start()
    })
})

test('extract 5', function() {
    stop()

    var url = 'http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/486'
    var title = '為何希望方仰寧下台'
    var score = 1
    var summary = 'robot   最新文章(10)  Promise 解決了什麼問題?OSDC.TW 2014 投影片為何希望方仰寧下台台灣工程師的主要問題你可能沒想過的 Python 用法Hey Jude - Hacker 版本F/OSS 的慢性自殺?libuncall 背後的想法Your First Platform Patch for B2G「超商竟然成了社會安全系統」的另一個角度  首頁新編最新留言 Entries RSS  重要關鍵字(10)  coding (122)Python (9'
    var description = '<td> <div><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_to_robot/">robot</a></div> <div> <div> <p>最新文章(10)</p> <ul> <li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/488">Promise 解決了什麼問題?</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/487">OSDC.TW 2014 投影片</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/486">為何希望方仰寧下台</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/485">台灣工程師的主要問題</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/484">你可能沒想過的 Python 用法</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/483">Hey Jude - Hacker 版本</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/482">F/OSS 的慢性自殺?</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/481">libuncall 背後的想法</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/480">Your First Platform Patch for B2G</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_id_doc/471">「超商竟然成了社會安全系統」的另一個角度</a></li> </ul> <a href="http://heaven.branda.to/~thinker/GinGin_CGI.py">首頁</a><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/new_doc">新編</a><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/last_comments">最新留言</a></p><p> <a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/rssfeed">Entries RSS</a></div> <div> <p>重要關鍵字(10)</p> <ul> <li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/coding">coding (122)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/Python">Python (91)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/FreeBSD">FreeBSD (71)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/WEB">WEB (61)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/URL">URL (48)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/hardware">hardware (46)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/javascript">javascript (36)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/Linux">Linux (34)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/blog">blog (30)</a></li><li><a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/C++">C++ (16)</a></li> </ul> <a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_all_kws">所有關鍵字</a></p><p> <a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/edit_new_url">新增 URL</a> </div> </div> </td><td> <div> <div> 為何希望方仰寧下台 <p> by thinker </p> </div> <div> <a href="javascript: init_mcol()"> 2 Columns </a> </div> <div> 關鍵字: <div> <a href="http://heaven.branda.to/~thinker/GinGin_CGI.py/show_kw_docs/雜記"> 雜記 </a> </div> </div> <div> 最後更新時間: 2014-04-12 13:20:58 CST | <a href="http://heaven.branda.to/~thinker/GinGin_TB.py/trackback/486?__mod=view"> 引用 </a> </div> <p> 查詢: </p> <p> COMMENTS: </p> <rdf:rdf> <rdf:description></rdf:description> </rdf:rdf> </div> </td>'

    // We can't parse it correctly, just verifying it doesn't breaks.
    extractor.extract(url, function(err, data) {
        equal(err, null, 'no errors')
        equal(data.url, url, 'url ok')
        equal(data.title, title, 'title ok')
        equal(data.score, score, 'score ok')
        equal(data.summary, summary, 'summary ok')
        equal(data.description, description, 'description ok')

        start()
    })
})
