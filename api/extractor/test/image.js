test('jpg', function* () {
    var url = 'https://farm4.staticflickr.com/3877/14590471994_c611cfbb25_k.jpg'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'jpg', 'type correct')
    equal(meta.width, 2048, 'width correct')
    equal(meta.height, 1363, 'height correct')
})

test('png', function* () {
    var url = 'https://farm7.staticflickr.com/6187/6085939488_f10ee7a713_o.png'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'png', 'type correct')
    equal(meta.width, 1029, 'width correct')
    equal(meta.height, 899, 'height correct')
})

test('gif', function* () {
    var url = 'https://farm9.staticflickr.com/8199/8227192531_66095f2b19_o.gif'
    var meta = yield image.getMeta(url)
    equal(meta.type, 'gif', 'type correct')
    equal(meta.width, 1800, 'width correct')
    equal(meta.height, 1390, 'height correct')
})
