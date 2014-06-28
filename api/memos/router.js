'use strict'

var Router = require('koa-router')

var memo = require('./controllers/memo')
var memos = require('./controllers/memos')

var auth = require('api/auth')

var router = module.exports = new Router()

router.get('/memos', auth.ensure, memos.read)
router.get('/memos/:id', auth.ensure, memo.read)

