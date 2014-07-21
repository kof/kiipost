var fs = require('fs')

var fix = __dirname + '/fixtures'

test('content analysis 1', function* () {
    var text = fs.readFileSync(fix + '/text1.txt', 'utf-8')
    var entities = [ 'State Senator Chris McDaniel', 'African-American voters',
        'spirited challenge', 'Republican runoff']
    var categories = ['Politics & Government']
    var data = yield analyze({text: text})

    ok(Array.isArray(data.entities), 'entities given')
    ok(Array.isArray(data.categories), 'categories given')
    equal(data.entities.length, entities.length, 'entities amount correct')
    data.entities.forEach(function(entity, i) {
        equal(entity.content, entities[i], 'entity matched')
    })
    equal(data.categories.length, categories.length, 'categories amount correct')
    data.categories.forEach(function(cat, i) {
        equal(cat.content, categories[i], 'category matched')
    })
})

test('content analysis 2', function* () {
    var text = fs.readFileSync(fix + '/text2.txt', 'utf-8')
    var entities = [ 'internet access', 'Google', 'vital resource', 'Project Loon']
    var categories = ['Technology & Electronics', 'Internet & Networking Technology', 'Arts & Entertainment']
    var data = yield analyze({text: text})

    ok(Array.isArray(data.entities), 'entities given')
    ok(Array.isArray(data.categories), 'categories given')
    equal(data.entities.length, entities.length, 'entities amount correct')
    data.entities.forEach(function(entity, i) {
        equal(entity.content, entities[i], 'entity matched')
    })
    equal(data.categories.length, categories.length, 'categories amount correct')
    data.categories.forEach(function(cat, i) {
        equal(cat.content, categories[i], 'category matched')
    })
})

test('content analysis 3', function* () {
    var text = fs.readFileSync(fix + '/text3.txt', 'utf-8')
    var entities = [ 'SACS', 'charter schools', 'Problems/Fixes', 'software release', 'Alternative Form', 'Charter School Unaudited', 'interim reports', 'Budget Software', 'Software', 'Standardized Account Code Structure', 'Software User Guide', 'State Board of Education', 'Windows Explorer']
    var categories = ['Software', 'Technology & Electronics']
    var data = yield analyze({text: text})
    ok(Array.isArray(data.entities), 'entities given')
    ok(Array.isArray(data.categories), 'categories given')
    equal(data.entities.length, entities.length, 'entities amount correct')
    data.entities.forEach(function(entity, i) {
        equal(entity.content, entities[i], 'entity matched')
    })
    equal(data.categories.length, categories.length, 'categories amount correct')
    data.categories.forEach(function(cat, i) {
        equal(cat.content, categories[i], 'category matched')
    })
})
