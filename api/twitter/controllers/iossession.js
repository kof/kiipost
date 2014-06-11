
/**
 * Create session for ios user.
 */
exports.create = function *() {
    console.log(this.request.body)
    this.body = this.request.body
}
