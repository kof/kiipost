'use strict'

var m = require('mongoose')

var client = require('../client')

exports.create = function* () {
    var user = yield m.model('user')
        .findById(this.session.user._id)
        .select({twitter: 1})
        .lean()
        .exec()

    try {
        var res = yield client.create(user.twitter)
            .tweet({status: this.request.body.text})

        this.body = {
            _id: res.idStr,
            text: res.text
        }
    } catch(err) {
        this.status = err.statusCode
        this.body = err.message
    }
}
