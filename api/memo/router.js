'use strict'

var Router = require('koa-router')
var memo = require('./controller')

var auth = require('api/auth')

var router = module.exports = new Router()

router.get('/memo', auth.ensure, memo.read)

