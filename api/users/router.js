'use strict'

var Router = require('koa-router')
var users = require('./controller')

var router = module.exports = new Router()

router.post('/users', users.create)

