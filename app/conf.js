'use strict'

exports.version = '{{conf.version}}'

exports.server = {
    baseUrl: '{{conf.client.baseUrl}}',
    sentryDsn: '{{conf.client.sentryDsn}}'
}

exports.twitter = {
    accessToken: '{{conf.twitter.accessToken}}',
    accessTokenSecret: '{{conf.twitter.accessTokenSecret}}',
    userId: '{{conf.twitter.userId}}'
}
