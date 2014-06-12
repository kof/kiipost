'use strict'

var queue = require('mongo-queue')
var m = require('mongoose')
var thunkify = require('thunkify')

var log = require('api/log')
var conf = require('api/conf')

var jobs = [require('./TwitterSync')]

var connection

exports.init = function() {
    connection = new queue.Connection({
        timeout: conf.queue.timeout,
        db: m.connection.db
    }).on('error', log)

    connection.enqueue = thunkify(connection.enqueue)

    new queue.Worker(connection, jobs, {workers: conf.queue.workers})
        .on('error', log)
        .poll()

    setInterval(function() {
        connection.cleanup(log)
    }, conf.queue.cleanupInterval)
}

/**
 * Save a job to the queue.
 */
exports.enqueue = function(job, options) {
    return function* () {
        yield connection.enqueue(job, options)
        if (options.isBlocker) {
            if (!options.userId) throw new Error('Missing required userId')
            var update = {}
            update['processing.' + job] = true
            yield m.model('user')
                .update({_id: options.userId}, {$set: update})
                .exec()
        }
    }
}
