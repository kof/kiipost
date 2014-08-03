var conf = require('api/conf');

module.exports = function(grunt) {
  grunt.template.addDelimiters('js', '[%', '%]')

  return {
    options: {
      data: {conf: conf},
      delimiters: 'js'
    },
    files: {
      src: '<%= config.dist %>/src/main.js',
      dest: '<%= config.dist %>/src/main.js'
    }
  };
}
