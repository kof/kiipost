var Template = require('mongo-queue').Template
var inherits = require('inherits')
var m = require('mongoose')

var log = require('api/log')

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
}

TwitterSync.prototype._done = function(err) {
    m.model('user').update(
        {_id: this.options.userId},
        {$set: {'processing.twitter': false}},
        function(_err) {
            this.complete(err || _err)
        }.bind(this)
    )
}
