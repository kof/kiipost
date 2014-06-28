/*globals require*/
require.config({
    shim: {

    },
    paths: {
        famous: '../lib/famous',
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        'famous-polyfills': '../lib/famous-polyfills/index',
        backbone: '../lib/backbone/backbone',
        jquery: '../lib/jquery/dist/jquery',
        inherits: '../lib/inherits/inherits',
        iscroll: '../lib/iscroll/iscroll',
        controller: '../lib/backbone.controller/backbone.controller',
        underscore: '../lib/underscore/underscore',
        'backbone.controller': '../lib/backbone.controller/backbone.controller',
        mustache: '../lib/hogan.js/hogan.js',
        'images-loader': '../lib/images-loader/build/ImagesLoader',
        multiline: '../lib/multiline/multiline',
        'underscore.string': '../lib/underscore.string/lib/underscore.string',
        'famous-infinitescroll': '../lib/famous-infinitescroll/infiniteScrollView',
        sinon: '../lib/sinon/lib/sinon',
        domready: '../lib/domready/ready',
        promise: '../lib/promise/promise',
        qs: '../lib/qs/qs',
        'rename-keys': '../lib/rename-keys/index',
        'jquery-ajax-retry': '../lib/jquery-ajax-retry/dist/jquery.ajax-retry',
        closest: '../lib/closest/closest',
        'components/log': './components/log/index'
    },
    packages: [

    ]
});
require(['main']);
