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

require('deep-freeze')(exports)
