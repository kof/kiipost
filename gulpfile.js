'use strict'

var gulp = require('gulp')
var sequence = require('run-sequence')
var gutil = require('gulp-util')
var program = require('commander')
var fs = require('fs')
var conf = require('api/conf')

program
    .option('-c, --cordova', 'build for cordova', Boolean)
    // TODO add all commands for documentation purpose.
    .parse(process.argv)

if (process.argv.length < 3) return program.help()

var task = {}
fs.readdirSync(__dirname + '/gulp').forEach(function(name) {
    if (/\.js$/.test(name)) task[name.substr(0, name.length - 3)] = require('./gulp/' + name)
})

var cordova = program.cordova || program.args[0] == 'cordova'
var env = process.env.ENV || 'local'
var src = './node_modules/app'
var dest = './dist/' + env

if (cordova) dest = './cordova/www'

gutil.log('Starting build for ' + env.toUpperCase() + (cordova ? ' CORDOVA' : '') + ' environment')

gulp.task('clean', task.clean({
    dest: dest + '/**'
}))

gulp.task('html', task.html({
    src: src + '/index.html',
    dest: dest,
    env: env,
    data: {cordova: cordova}
}))

gulp.task('css', task.css({
    src: src + '/index.css',
    dest: dest,
    env: env
}))

gulp.task('js', task.js({
    entry: src + '/bootstrap.js',
    dest: dest,
    env: env,
    data: {conf: conf}
}))

gulp.task('content', task.copy({
    src: src + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('api', task.api())

gulp.task('watch-app', ['build'], function() {
    gulp.watch(src + '/**/*.{js,html}', ['js'])
    gulp.watch(src + '/**/*.html', ['html'])
    gulp.watch(src + '/**/*.css', ['css'])
    gulp.watch(src + '/**/*.{png,jpg,svg,eot,ttf,woff}', ['content'])
})

gulp.task('test', task.test())

gulp.task('lint', task.lint({
    src: src + '/**/*.js'
}))

gulp.task('ln', task.ln({
    src: ['./shared', './api', './app'],
    dest: './node_modules'
}))

gulp.task('start', ['watch-app', 'api'])

gulp.task('build', function(callback) {
    var args = ['clean', ['css', 'content', 'js', 'html'], callback]
    if (env == 'stage' || env == 'prod') args.unshift('lint')
    sequence.apply(null, args)
})

gulp.task('cordova', ['build'], task.cordova())
