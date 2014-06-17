'use strict'

var Router = require('koa-router')
var controller = require('./controller')

var router = module.exports = new Router()

router.get('/articles', controller.read)

