var qunit = require('qunit')

var tests = []

tests.push({
    code: {
        path: './shared/utils/transformKeys.js',
        namespace: 'transformKeys'
    },
    tests: './shared/utils/test/transformKeys.js',
    deps: 'node_modules/amd-loader'
})

tests.push({
    code: {
        path: './api/extractor/index.js',
        namespace: 'extractor'
    },
    tests: './api/extractor/test/index.js'
})

tests.push({
    code: {
        path: './api/extractor/image.js',
        namespace: 'image'
    },
    tests: './api/extractor/test/image.js'
})

tests.push({
    code: {
        path: './api/yahoo/contentAnalysis.js'
    },
    tests: './api/yahoo/test/contentAnalysis.js'
})

qunit.setup({
    coverage: false
})

qunit.run(tests, function(err) {
    if (err) console.log(err.stack)
    process.exit(err || qunit.log.stats().failed > 0 ? 1 : 0)
})
