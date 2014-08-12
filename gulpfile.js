'use strict'

var gulp = require('gulp')
var sequence = require('run-sequence')
var gutil = require('gulp-util')
var program = require('commander')
var conf = require('./api/conf')
var tasks = require('./gulp')

// TODO add all commands for documentation purpose.
program
    .option('-c, --cordova', 'build for cordova')
    .parse(process.argv)

if (process.argv.length < 3) return program.help()

var cordova = program.cordova
var env = conf.env
var src = './node_modules/app'
var dest = './dist/' + env

if (cordova) dest = './cordova/www'

gutil.log('Starting build for ' + env.toUpperCase() + (cordova ? ' CORDOVA' : '') + ' environment')

gulp.task('clean', tasks.clean({
    dest: dest + '/**'
}))

gulp.task('html', tasks.html({
    src: src + '/index.html',
    dest: dest,
    env: env,
    data: {cordova: cordova}
}))

gulp.task('css', tasks.css({
    src: src + '/index.css',
    dest: dest,
    env: env
}))

gulp.task('js', tasks.js({
    entry: src + '/bootstrap.js',
    dest: dest,
    env: env,
    data: {conf: conf}
}))

gulp.task('content', tasks.copy({
    src: src + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('api', tasks.api())

gulp.task('watch-app', ['build'], function() {
    gulp.watch(src + '/**/*.{js,html,svg}', ['js'])
    gulp.watch(src + '/**/*.html', ['html'])
    gulp.watch(src + '/**/*.css', ['css'])
    gulp.watch(src + '/**/*.{png,jpg,svg,eot,ttf,woff}', ['content'])
})

gulp.task('test', tasks.test())

gulp.task('lint', tasks.lint({
    src: src + '/**/*.js'
}))

gulp.task('start', ['watch-app', 'api'])

gulp.task('cordova', tasks.cordova({
    dest: './cordova',
    data: {conf: conf}
}))

gulp.task('build', function(callback) {
    var args = ['clean', ['css', 'content', 'js', 'html']]
    if (env == 'stage' || env == 'prod') args.unshift('lint')
    if (cordova) args.push('cordova')
    args.push(callback)
    sequence.apply(null, args)
})
