var fs = require('fs')
var fix = __dirname + '/fixtures/keywords'
var text0 = fs.readFileSync(fix + '/text0.txt', 'utf-8')

test('keywords 0', function* () {
    var expected = [
        {
            term: 'Digg',
            tf: 20,
            tag: 'digg',
            density: 8.23045267489712
        }, {
            term: 'Deeper',
            tf: 8,
            tag: 'deeper',
            density: 3.292181069958848
        }, {
            term: 'alert',
            tf: 6,
            tag: 'alert',
            density: 2.4691358024691357
        }, {
            term: 'stories',
            tf: 5,
            tag: 'stories',
            density: 2.05761316872428
        }, {
            term: 'Twitter',
            tf: 5,
            tag: 'twitter',
            density: 2.05761316872428
        }, {
            term: 'friends',
            tf: 4,
            tag: 'friends',
            density: 1.646090534979424
        }, {
            term: 'user',
            tf: 4,
            tag: 'user',
            density: 1.646090534979424
        }, {
            term: 'link',
            tf: 4,
            tag: 'link',
            density: 1.646090534979424
        }, {
            term: 'product',
            tf: 4,
            tag: 'product',
            density: 1.646090534979424
        }, {
            term: 'social',
            tf: 4,
            tag: 'social',
            density: 1.646090534979424
        }, {
            term: 'app',
            tf: 4,
            tag: 'app',
            density: 1.646090534979424
        }, {
            term: 'web',
            tf: 3,
            tag: 'web',
            density: 1.2345679012345678
        }, {
            term: 'share',
            tf: 3,
            tag: 'share',
            density: 1.2345679012345678
        }, {
            term: 'made',
            tf: 3,
            tag: 'made',
            density: 1.2345679012345678
        }, {
            term: 'time',
            tf: 3,
            tag: 'time',
            density: 1.2345679012345678
        }, {
            term: 'mobile',
            tf: 3,
            tag: 'mobile',
            density: 1.2345679012345678
        }, {
            term: 'Betaworks',
            tf: 3,
            tag: 'betaworks',
            density: 1.2345679012345678
        }, {
            term: 'offer',
            tf: 3,
            tag: 'offer',
            density: 1.2345679012345678
        }, {
            term: 'read',
            tf: 3,
            tag: 'read',
            density: 1.2345679012345678
        }, {
            term: 'personalized',
            tf: 3,
            tag: 'personalized',
            density: 1.2345679012345678
        }, {
            term: 'company',
            tf: 3,
            tag: 'company',
            density: 1.2345679012345678
        }, {
            term: 'sources',
            tf: 3,
            tag: 'sources',
            density: 1.2345679012345678
        }, {
            term: 'service',
            tf: 3,
            tag: 'service',
            density: 1.2345679012345678
        }
    ]

    deepEqual(extract(text0, {verbose: true}), expected, 'keywords ok')
    var text1 = 'Material, a sexy Flipboard competitor, comes to the iPhone http://t.co/oarNsv83Af'
    var expected = [
        'http',
        'iphone',
        'material',
        'competitor',
        'flipboard',
        'sexy',
        'oarnsv83af'
    ]
    deepEqual(extract(text1,  {minDensity: 0}), expected, 'keywords with no frequency extracted')
})

