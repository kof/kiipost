'use strict'

var gulp = require('gulp')
var sequence = require('run-sequence')
var gutil = require('gulp-util')
var program = require('commander')

program
    .option('-c, --cordova', 'build for cordova', Boolean)
    .parse(process.argv)

var task = {}
;['clean', 'css', 'copy', 'js', 'html', 'test', 'lint', 'ln', 'cordova'].forEach(function(name) {
    task[name] = require('./gulp/' + name)
})

var cordova = program.cordova || process.argv[2] == 'cordova'
var env = process.env.ENV
var app = './node_modules/app'
var dest = './dist/' + env
if (cordova) dest = './cordova/www'

gutil.log('Starting build for ' + env.toUpperCase() + (cordova ? ' CORDOVA' : '') + ' environment')

gulp.task('clean', task.clean({
    dest: dest + '/**'
}))

gulp.task('css', task.css({
    src: app + '/index.css',
    dest: dest
}))

gulp.task('content', task.copy({
    src: app + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('js', task.js({
    src: app + '/index.js',
    dest: dest,
    env: env
}))

gulp.task('html', task.html({
    src: app + '/index.html',
    dest: dest,
    env: env,
    cordova: cordova
}))

gulp.task('watch', ['build'], function() {
    gulp.watch(app + '/**/*.js', ['js'])
    gulp.watch(app + '/**/*.html', ['html'])
    gulp.watch(app + '/**/*.css', ['css'])
    gulp.watch(app + '/**/*.{png,jpg,svg,eot,ttf,woff}', ['content'])
})

gulp.task('build', function(callback) {
    sequence('clean', ['css', 'content', 'js', 'html'], callback)
})

gulp.task('test', task.test())

gulp.task('lint', task.lint({
    src: app + '/**/*.js'
}))

gulp.task('ln', task.ln({
    src: ['./shared', './api', './app'],
    dest: './node_modules'
}))

gulp.task('cordova', ['build'], task.cordova())

gulp.task('default', ['build'])
