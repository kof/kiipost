var baseUrl = require('api/test/serve')(__dirname + '/fixtures/image')

test('jpg', function* () {
    var url = baseUrl + '/1.jpg'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'jpg', 'type correct')
    equal(meta.width, 2048, 'width correct')
    equal(meta.height, 1239, 'height correct')
})

test('png', function* () {
    var url = baseUrl + '/1.png'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'png', 'type correct')
    equal(meta.width, 1029, 'width correct')
    equal(meta.height, 899, 'height correct')
})

test('gif', function* () {
    var url = baseUrl + '/1.gif'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'gif', 'type correct')
    equal(meta.width, 1800, 'width correct')
    equal(meta.height, 1390, 'height correct')
})
