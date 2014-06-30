define(function(require, exports, module) {
    'use strict'

    var iosHelper = require('screens/signin/mocks/helpers/ios')

    if (!window.cordova) {
        iosHelper()
    }

/*
    require('screens/signin/mocks/api')()
    require('screens/articles/mocks/api')()
    require('screens/full-article/mocks/api')()
    require('screens/memos/mocks/api')()
*/
})
