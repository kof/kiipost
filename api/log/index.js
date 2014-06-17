function log(err) {
    if (!err) return
    console.log.apply(console, arguments)
    if (err.stack) console.log(err.stack)
}
module.exports = exports = log
exports.fatal = exports.info = log
