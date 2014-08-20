var koa = require('koa')
var serve = require('koa-static')
var os = require('os')
var fs = require('fs')

var tmp = os.tmpdir()

function getPort() {
    try {
        var port = fs.readFileSync(tmp + 'kiipost-test-port.txt', 'utf-8')
    } catch(err) {}

    if (port && port.length) {
        port = Number(port)
        port++
    } else {
        port = 3001
    }

    if (port > 4000) port = 3001

    fs.writeFileSync(tmp + 'kiipost-test-port.txt', port)

    return port
}

module.exports = function(dir) {
    var app = koa()
    app.use(serve(dir))
    app.on('error', console.log)
    var port = getPort()
    app.listen(port)
    return 'http://localhost:' + port
}
