'use strict'

var gulp = require('gulp')
var program = require('commander')

program
    .option('-c, --cordova', 'build for cordova')
    .parse(process.argv)

var tasks = {}
;['clean', 'css', 'copy', 'js', 'html'].forEach(function(name) {
    tasks[name] = require('./gulp/' + name)
})

var env = process.env.ENV

var app = __dirname + '/node_modules/app'
var dest = __dirname + '/dist/' + (program.cordova ? 'cordova-' + env : env)

gulp.task('clean', tasks.clean({
    dest: dest + '/**'
}))

gulp.task('css', ['clean'], tasks.css({
    src: app + '/index.css',
    dest: dest
}))

gulp.task('content', ['clean'], tasks.copy({
    src: app + '/**/*.{png,jpg,svg,eot,ttf,woff}',
    dest: dest
}))

gulp.task('js', ['clean'], tasks.js({
    src: app + '/index.js',
    dest: dest,
    env: env
}))

gulp.task('html', ['clean'], tasks.html({
    src: app + '/index.html',
    dest: dest,
    env: env,
    cordova: program.cordova
}))

gulp.task('build', ['css', 'content', 'js', 'html'])

gulp.task('default', ['build'])
