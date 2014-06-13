module.exports = exports = exports.fatal = function(err) {
    if (!err) return
    console.log.apply(console, arguments)
    console.log(err.stack)
}
