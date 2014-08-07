var ms = require('ms')

var env = process.env

if (!env.ENV) throw new Error('ENV required')

exports.version = require('../../package.json').version

exports.env = env.ENV || 'local'

exports.db = {
    url: env.MONGO_URL,
    options: {
        db: {
            // Default write concern: expect confirmation by primary.
            w: 1
        },
        server: {
            auto_reconnect: true,
            poolSize: 10
        },
        native_parser: true
    }
}

exports.server = {
    port: env.PORT,
    stdout: true,
    stderr: true,
    sentryDsn: env.SENTRY_DSN
}

// For the clients.
exports.client = {
    baseUrl: '',
    sentryDsn: ''
}

exports.cors = {
    headers: ['accept', 'x-requested-with', 'content-type'],
    expose: ['retry-after'],
    credentials: true
}

exports.session = {
    key: 'kiipost.sid',
    httpOnly: true,
    signed: true,
    overwrite: true,
    path: '/',
    maxage: ms('5d')
}

exports.twitter = {
    consumerKey: 'JmTqJFn47mOp14NpR0UiSdxig',
    consumerSecret: 'MHTdjpIwfVjcV2rZOyxesl939FqlnIKFzE50DhLZmG5UCwAViI'
}

exports.queue = {
    // Time in ms, which will be saved as a timeout in the db
    // if calling cleanup, timedout jobs will be available again.
    timeout: ms('5m'),
    // Amount of workers, which are running in parallel in the same process.
    workers: 5,
    workerInterval: 1000,
    // Periodically cleanup call 50 sec.
    cleanupInterval: ms('50s')
}

exports.request = {
    agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
    accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    timeout: 20000
}

exports.article = {
    // How old can be an in days.
    maxAge: 60
}

var extend = require('extend')
var envConf = require('./' + env.ENV)
extend(true, exports, envConf)
require('deep-freeze')(exports)
