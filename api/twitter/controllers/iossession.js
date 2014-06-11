var client = require('../helpers/client')

/**
 * Create session for ios user.
 */
exports.create = function *(next) {
    try {
        yield client.create(this.request.body).verifyCredentials()
        this.session.isAuthorized = true
        this.body = this.request.body
        this.body._id = this.session._id
    } catch(err) {
        this.status = 'unauthorized'
    }
}
