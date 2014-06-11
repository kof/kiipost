
/**
 * Create session for ios user.
 */
exports.create = function *() {
    this.session.auth = this.request.body
    this.session.test = 123
    console.log(this.request.body, this.session)
    this.body = this.request.body
}
