'use strict'

var Router = require('koa-router')
var user = require('./controller')

var router = module.exports = new Router()

router.post('/user', user.create)

