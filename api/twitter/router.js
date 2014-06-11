var Router = require('koa-router')
var iosSession = require('./controllers/iossession')

var router = module.exports = new Router()

router.post('/twitter/iosSession', iosSession.create)

