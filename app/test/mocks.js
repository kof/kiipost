'use strict'

var conf = require('app/conf')

if (!conf.twitter.userId) return

require('app/screens/signin/mocks/helpers/ios')()
require('app/screens/signin/mocks/api')()
require('app/screens/memos/mocks/api')()
require('app/screens/articles/mocks/api')()
require('app/screens/full-article/mocks/api')()
