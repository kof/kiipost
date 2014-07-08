test('jpg', function() {
    var url = 'https://farm4.staticflickr.com/3877/14590471994_c611cfbb25_k.jpg'
    stop()
    getImageSize(url)(function(err, size) {
        equal(err, null, 'no errors')
        equal(size.width, 2048, 'width correct')
        equal(size.height, 1363, 'height correct')
        start()
    })
})

test('png', function() {
    var url = 'https://farm7.staticflickr.com/6187/6085939488_f10ee7a713_o.png'
    stop()
    getImageSize(url)(function(err, size) {
        equal(err, null, 'no errors')
        equal(size.width, 1029, 'width correct')
        equal(size.height, 899, 'height correct')
        start()
    })
})

test('gif', function() {
    var url = 'https://farm9.staticflickr.com/8199/8227192531_66095f2b19_o.gif'
    stop()
    getImageSize(url)(function(err, size) {
        equal(err, null, 'no errors')
        equal(size.width, 1800, 'width correct')
        equal(size.height, 1390, 'height correct')
        start()
    })
})
