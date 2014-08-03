define(function(require, exports, module) {
    'use strict'

    exports.version = '[%= conf.version %]'

    exports.server = {
        baseUrl: '[%= conf.client.baseUrl %]',
        sentryDsn: '[%= conf.client.sentryDsn %]'
    }
})
