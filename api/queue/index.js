'use strict'

var queue = require('mongo-queue')
var m = require('mongoose')
var thunkify = require('thunkify')
var co = require('co')

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

    new queue.Worker(connection, jobs, {
        workers: conf.queue.workers,
        timeout: conf.queue.workerInterval
    }).on('error', log).poll()

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
        if (options.block) yield setProcessing(options.block, job, true)
    }
}

var complete = queue.Template.prototype.complete

/**
 * Set processing to false when job is completed.
 */
queue.Template.prototype.complete = function(err) {
    var args = this.doc.args
    var userId = args ? args[0].block : null
    var job = this.doc.queue

    co(function* () {
        if (userId) yield setProcessing(userId, job, false)
        complete.call(this, err)
    }).call(this)
}

/**
 * Set processing flag on user for a job.
 */
function setProcessing(userId, job, value) {
    return function* () {
        var update = {}
        update['processing.' + job] = value
        yield m.model('user')
            .update({_id: userId}, {$set: update})
            .exec()
    }
}

