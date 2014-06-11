'use strict'

var log = require('api/log')

Error.stackTraceLimit = 20

process.on('uncaughtException', function(err) {

    // Use nextTick here because if an error happens at bootstrap,
    // this handler is called before other modules used here are required
    // which leads to uncaughtException inside of uncaughtException.
    process.nextTick(function() {
        // For the case logging triggers also an error.
        try {
            log.fatal(err, function() {
                process.exit(1)
            })
        } catch(_err) {
            console.error(err)
            process.exit(1)
        }
    })
})
