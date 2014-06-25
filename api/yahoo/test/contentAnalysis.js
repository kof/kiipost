test('content analysis', function() {
    var text = 'HATTIESBURG, Miss. — With an unusual assist from African-American voters and other Democrats who feared his opponent, Senator Thad Cochran on Tuesday beat back a spirited challenge from State Senator Chris McDaniel, triumphing in a Republican runoff and defeating the Tea Party in the state where the movement’s hopes were bright.'
    var entities = [ 'State Senator Chris McDaniel', 'African-American voters',
        'spirited challenge', 'Republican runoff']
    var categories = ['Politics & Government']

    stop()
    analyze({text: text})(function(err, data) {
        equal(err, null, 'no errors')
        ok(Array.isArray(data.entities), 'entities given')
        ok(Array.isArray(data.categories), 'categories given')
        data.entities.forEach(function(entity, i) {
            equal(entity.content, entities[i], 'entity matched')
        })
        data.categories.forEach(function(cat, i) {
            equal(cat.content, categories[i], 'category matched')
        })
        start()
    })
})
