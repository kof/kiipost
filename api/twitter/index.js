var route = require('koa-route')
var compose = require('koa-compose')
var auth = require('./controllers/auth')

module.exports = compose([route.get('/', auth.read)])

