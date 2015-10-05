module.exports = function(grunt) {
  var path = require('path');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-browserify');


  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'tests/**/*.js', 'features/**/*.js']
    },
    eslint: {
      src: ['lib/**/*.js', 'examples/**/*.js', '!examples/amd/require.js', '!examples/lib/*']
    }
  });

  grunt.registerTask('default', ['jshint', 'eslint', 'browserify']);
};
