'use strict'

var gulp = require('gulp')
var sequence = require('run-sequence')
var gutil = require('gulp-util')
var program = require('commander')
var conf = require('./api/conf')
var tasks = require('./gulp')

program
    .option('-c, --cordova', 'build for cordova', Boolean)
    // TODO add all commands for documentation purpose.
    .parse(process.argv)

if (process.argv.length < 3) return program.help()


var cordova = program.cordova || program.args[0] == 'cordova'
var env = process.env.ENV || 'local'
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
    gulp.watch(src + '/**/*.{js,html}', ['js'])
    gulp.watch(src + '/**/*.html', ['html'])
    gulp.watch(src + '/**/*.css', ['css'])
    gulp.watch(src + '/**/*.{png,jpg,svg,eot,ttf,woff}', ['content'])
})

gulp.task('test', tasks.test())

gulp.task('lint', tasks.lint({
    src: src + '/**/*.js'
}))

gulp.task('ln', tasks.ln({
    src: ['./shared', './api', './app'],
    dest: './node_modules'
}))

gulp.task('start', ['watch-app', 'api'])

gulp.task('build', function(callback) {
    var args = ['clean', ['css', 'content', 'js', 'html'], callback]
    if (env == 'stage' || env == 'prod') args.unshift('lint')
    sequence.apply(null, args)
})

gulp.task('cordova', ['build'], tasks.cordova())
