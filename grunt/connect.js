// The actual grunt server settings
module.exports =  function (grunt) {
  'use strict';
  return {
    options: {
      port: grunt.option('port') || 1337,
      livereload: grunt.option('livereload') || 1338,
      // Change this to '0.0.0.0' to access the server from outside
      hostname: grunt.option('hostname') || '0.0.0.0'
    },
    livereload: {
      options: {
        open: true,
        base: [
          '.tmp',
          '<%= config.app %>'
        ]
      }
    },
    dist: {
      options: {
        open: true,
        base: '<%= config.dist %>',
        livereload: false
      }
    }
  };
};
