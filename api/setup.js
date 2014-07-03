'use strict'

// Setup stuff used in all situations like webserver, worker, bin script.
require('amd-loader')
var _ = require('underscore')
var setup = require('api/error/setup')
var log = require('api/log')
var conf = require('api/conf')

log.setup(_.pick(conf.server, 'sentryDsn', 'stderr', 'stdout'))
