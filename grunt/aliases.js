var metrics = require('famous-metrics');

module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('serve', function (target) {

    if (!metrics.getTinfoil()) {
      metrics.track('grunt serve', {});
    }

    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'processhtml:dev',
      'connect:livereload',
      'watch'
    ]);
  });

  // build - for web
  // build:cordova - for cordova
  grunt.registerTask('build', function (target) {
    var tasks

    tasks = [
      'clean:dist',
      //'lint',
      'processhtml:dist',
      'useminPrepare',
      'requirejs',
      'concat',
      'cssmin',
      'uglify',
      'copy:dist',
      'rev',
      'usemin',
      'relativeRoot:dist',
      'htmlmin'
    ];

    // Set dist for cordova
    if (target == 'cordova') {
      grunt.config('config.dist', grunt.config('config').cordova);
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask('lint', [
    'jscs',
    'eslint'
  ]);

  grunt.registerTask('test', [
    'lint'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
