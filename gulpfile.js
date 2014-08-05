'use strict'

var gulp = require('gulp')
var sequence = require('run-sequence')
var gutil = require('gulp-util')
var program = require('commander')

program
    .option('-c, --cordova', 'build for cordova', Boolean)
    // TODO add all commands for documentation purpose.
    .parse(process.argv)

if (!program.args.length) return program.help()

var task = {}
;['clean', 'css', 'copy', 'js', 'html', 'test', 'lint', 'ln', 'cordova', 'api'].forEach(function(name) {
    task[name] = require('./gulp/' + name)
})

var cordova = program.cordova || program.args[0] == 'cordova'
var env = process.env.ENV
var app = './node_modules/app'
var dest = './dist/' + env
if (cordova) dest = './cordova/www'

gutil.log('Starting build for ' + env.toUpperCase() + (cordova ? ' CORDOVA' : '') + ' environment')

gulp.task('clean', task.clean({
    dest: dest + '/**'
}))

gulp.task('html', task.html({
    src: app + '/**/*.html',
    dest: dest,
    env: env,
    cordova: cordova
}))

gulp.task('css', task.css({
    src: app + '/index.css',
    dest: dest,
    env: env
}))

gulp.task('js', task.js({
    src: app + '/index.js',
    dest: dest,
    env: env
}))

gulp.task('content', task.copy({
    src: app + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('api', task.api())

gulp.task('watch-app', ['build'], function() {
    gulp.watch(app + '/**/*.js', ['js'])
    gulp.watch(app + '/**/*.html', ['html'])
    gulp.watch(app + '/**/*.css', ['css'])
    gulp.watch(app + '/**/*.{png,jpg,svg,eot,ttf,woff}', ['content'])
})

gulp.task('test', task.test())

gulp.task('lint', task.lint({
    src: app + '/**/*.js'
}))

gulp.task('ln', task.ln({
    src: ['./shared', './api', './app'],
    dest: './node_modules'
}))

gulp.task('start', ['watch-app', 'api'])

gulp.task('build', function(callback) {
    sequence('clean', ['css', 'content', 'js', 'html'], callback)
})

gulp.task('cordova', ['build'], task.cordova())
