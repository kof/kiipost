var app = require('koa')()

var modules = ['twitter']

modules.forEach(function(module) {
    app.use(require('./' + module))
})

app.listen(3000)
