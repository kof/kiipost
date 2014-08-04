'use strict'

var gulp = require('gulp')
var program = require('commander')
var sequence = require('run-sequence')

program
    .option('-c, --cordova', 'build for cordova')
    .parse(process.argv)

var tasks = {}
;['clean', 'css', 'copy', 'js', 'html'].forEach(function(name) {
    tasks[name] = require('./gulp/' + name)
})

var env = process.env.ENV

var app = './node_modules/app'
var dest = './dist/' + (program.cordova ? 'cordova-' + env : env)

gulp.task('clean', tasks.clean({
    dest: dest + '/**'
}))

gulp.task('css', tasks.css({
    src: app + '/index.css',
    dest: dest
}))

gulp.task('content', tasks.copy({
    src: app + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('js', tasks.js({
    src: app + '/index.js',
    dest: dest,
    env: env
}))

gulp.task('html', tasks.html({
    src: app + '/index.html',
    dest: dest,
    env: env,
    cordova: program.cordova
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

gulp.task('default', ['build'])
