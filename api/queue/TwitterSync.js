var queue = require('mongo-queue')
var inherits = require('inherits')
var m = require('mongoose')

var log = require('api/log')

function TwitterSync() {
    queue.Template.apply(this, arguments)
}

inherits(TwitterSync, queue.Template)
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
    this.options = options

    sync({user: options.userId})
        .on('error', this._done.bind(this))
        .on('complete', function(err, errors) {
            // We process 1 user at once, so there can be just 1 error.
            if (!err && errors.length) err = errors[0]
            this._done(err)
        }.bind(this))
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
