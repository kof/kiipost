var gulp = require('gulp')

var middlewares = {}
;['clean', 'cssimport', 'copy', 'js'].forEach(function(name) {
    middlewares[name] = require('./gulp/' + name)
})

var env = process.env.ENV
var dest = __dirname + '/dist/' + env

gulp.task('clean', middlewares.clean({
    dest: dest + '/**'
}))

gulp.task('importcss', ['clean'], middlewares.cssimport({
    src: './app/styles/index.css',
    dest: dest
}))

gulp.task('content', ['clean'], middlewares.copy({
    src: './app/**/*.+(png|jpg|svg|eot|ttf|woff|html)',
    dest: dest
}))

gulp.task('js', ['clean'], middlewares.js({
    src: './app/index.js',
    dest: dest,
    env: env
}))

gulp.task('build', ['importcss', 'content', 'js'])

gulp.task('default', ['build'])
