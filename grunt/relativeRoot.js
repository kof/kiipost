module.exports = {
  dist: {
    options: {
      root: '<%= config.dist %>'
    },
    files: [{
      expand: true,
      cwd: '<%= config.dist %>/css/',
      src: ['*.css'],
      dest: '<%= config.dist %>/css/',
    }]
  }
}
