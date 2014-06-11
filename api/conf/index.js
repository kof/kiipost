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
    secret: '3997pa3NaE',
    key: 'kiipost.sid',
    cookie: {
        path: '/',
        httpOnly: true,
        maxage: ms('5d'),
        rewrite: true,
        signed: true
    },
    store: {
        expiration: ms('5d')
    }
}

require('deep-freeze')(exports)
