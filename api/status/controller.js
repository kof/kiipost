var m = require('mongoose')

/**
 * This route is for f.e. siteuptime to verify on high level everything is ok.
 */
exports.read = function* () {
    this.body = yield m.model('user').count().exec()
}
