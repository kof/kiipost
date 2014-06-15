'use strict'

var m = require('mongoose')

var ObjectId = m.Schema.ObjectId
var user

user = new m.Schema({
    firstName: String,
    lastName: String,
    birthday: Date,
    email: String,
    gender: String,
    locale: String,
    imageUrl: String,
    signupDate: Date,
    lastLoginDate: Date,
    twitter: {
        id: Number,
        screenName: String,
        accessToken: String,
        accessTokenSecret: String,
        location: String,
        protected: Boolean,
        lang: String,
        verified: Boolean,
        lastUpdatedTweet: String
    },
    processing: {
        TwitterSync: Boolean
    }
})

user.index({'twitter.id': 1}, {unique: true, sparse: true})

module.exports = user
