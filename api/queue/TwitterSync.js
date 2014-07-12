var Template = require('mongo-queue').Template
var inherits = require('inherits')
var m = require('mongoose')
var co = require('co')

var log = require('api/log')
var sync = require('api/twitter/sync')

function TwitterSync() {
    Template.apply(this, arguments)
}

inherits(TwitterSync, Template)
module.exports = TwitterSync

/**
 * Sync and analyze user tweets.
 *
 *
 * Options:
 * - `userId`
 *
 * @param {Object} options
 */
TwitterSync.prototype.perform = function(options) {
    co(function* () {
        yield sync(options)
        this.complete()
    }).call(this, this.complete)
}
