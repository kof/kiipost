var conf = require('api/conf');

module.exports = function(grunt) {
  grunt.template.addDelimiters('js', '[%', '%]')

  return {
    options: {
      data: {conf: conf},
      delimiters: 'js'
    },
    files: {
      src: '<%= config.dist %>/bundle.js',
      dest: '<%= config.dist %>/bundle.js'
    }
  };
}
