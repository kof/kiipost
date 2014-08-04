var gulp = require('gulp')

var tasks = {}
;['clean', 'cssimport', 'copy', 'js'].forEach(function(name) {
    tasks[name] = require('./gulp/' + name)
})

var env = process.env.ENV
var dest = __dirname + '/dist/' + env

gulp.task('clean', tasks.clean({
    dest: dest + '/**'
}))

gulp.task('importcss', ['clean'], tasks.cssimport({
    src: './app/styles/index.css',
    dest: dest
}))

gulp.task('content', ['clean'], tasks.copy({
    src: './app/**/*.{png,jpg,svg,eot,ttf,woff,html}',
    dest: dest
}))

gulp.task('js', ['clean'], tasks.js({
    src: './app/index.js',
    dest: dest,
    env: env
}))

gulp.task('build', ['importcss', 'content', 'js'])

gulp.task('default', ['build'])
