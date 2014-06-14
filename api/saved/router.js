'use strict'

var Router = require('koa-router')
var saved = require('./controller')

var auth = require('api/auth')

var router = module.exports = new Router()

router.get('/saved', auth.ensure, saved.read)

