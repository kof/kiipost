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
        iscroll: '../lib/iscroll/build',
        controller: '../lib/backbone.controller/backbone.controller',
        underscore: '../lib/underscore/underscore',
        'backbone.controller': '../lib/backbone.controller/backbone.controller',
        mustache: '../lib/hogan.js/hogan.js',
        'images-loader': '../lib/images-loader/build/ImagesLoader',
        multiline: '../lib/multiline/multiline'
    },
    packages: [

    ]
});
require(['main']);
