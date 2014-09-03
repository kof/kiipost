'use strict'

var Router = require('koa-router')

var tweets = require('./controllers/tweets')

var auth = require('api/auth')

var router = module.exports = new Router()

router.post('/tweets', auth.ensure, tweets.create)

