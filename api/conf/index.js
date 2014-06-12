var ms = require('ms')

exports.db = {
    url: process.env.MONGO_URL,
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
    port: process.env.PORT
}

exports.cors = {
    headers: ['accept', 'x-requested-with', 'content-type'],
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
    // if calling cleanup, timedout jobs will be available again
    timeout: ms('5m'),
    // Amount of workers, which are running in parallel in the same process.
    workers: 5,
    // Periodically cleanup call 50 sec
    cleanupInterval: ms('50s')
}


require('deep-freeze')(exports)
