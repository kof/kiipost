'use strict'

var _ = require('underscore')
var log = require('api/log')
var signin = require('./signin')

/**
 * Create session for ios user.
 */
exports.create = function *() {
    try {
        this.body = yield signin(this.request.body, this.session.isAuthorized)
        this.session.$set('isAuthorized', true)
        this.session.$set('user', _.pick(this.body, '_id'))
    } catch(err) {
        log(err)
        this.status = 'unauthorized'
    }
}
