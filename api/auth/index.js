/**
 * Middleware to ensure user is rejected when not authorized.
 */
exports.ensure = function* (next) {
    if (!this.session || !this.session.isAuthorized) {
        this.status = 'unauthorized'
    } else {
        yield next
    }
}
