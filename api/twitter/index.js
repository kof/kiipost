var route = require('koa-route')
var compose = require('koa-compose')
var iosSession = require('./controllers/iossession')

module.exports = compose([
    route.post('/api/twitter/iosSession', iosSession.create)
])

