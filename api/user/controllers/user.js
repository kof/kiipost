'use strict'

var signin = require('../helpers/signin')
var log = require('api/log')

/**
 * Create session for ios user.
 */
exports.create = function *() {
    try {
        this.body = yield signin(this.request.body, this.session.isAuthorized)
        this.session.isAuthorized = true
    } catch(err) {
        log(err)
        this.status = 'unauthorized'
    }
}
