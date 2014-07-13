'use strict'

var Router = require('koa-router')

var auth = require('api/auth')

var articles = require('./controllers/articles')
var article = require('./controllers/article')
var info = require('./controllers/info')

var router = module.exports = new Router()

router.get('/articles', auth.ensure, articles.read)
router.get('/articles/info/:id', auth.ensure, info.read)
router.get('/articles/:id', auth.ensure, article.read)

