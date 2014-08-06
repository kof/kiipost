'use strict'

var Router = require('koa-router')
var status = require('./controller')

var router = module.exports = new Router()

router.get('/status', status.read)

