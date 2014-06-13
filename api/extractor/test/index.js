test('extract', function() {
    var data

    stop()

    data = {
        icon: 'http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/homescreen_TCIcon_ipad_2x.png?m=1391183173g',
        images: [ 'http://s1.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/techcrunch.global.thumb-placeholder.png?m=1391183173g' ],
        title: 'Interview With Mark Zuckerberg At Web 2.0 Summit (VIDEO) |…',
        description: 'This is seriously the best Mark Zuckerberg interview I\'ve ever seen. Fresh off of the announcement of Facebook Messages (yes, that\'s what the product is..',
        tags: [ 'Facebook', ' Mark Zuckerberg' ]
    }

    extractor.extract('http://techcrunch.com/2010/11/18/mark-zuckerberg/')(function(err, _data) {
        equal(err, null, 'no errors')
        deepEqual(_data, data, 'data correct')
        start()
    })
})
