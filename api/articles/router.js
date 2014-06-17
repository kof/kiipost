'use strict'

var Router = require('koa-router')
var articles = require('./controllers/articles')
var article = require('./controllers/article')

var router = module.exports = new Router()

router.get('/articles', articles.read)
router.get('/articles/article/:id', article.read)

