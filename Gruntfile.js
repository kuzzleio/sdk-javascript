module.exports = function(grunt) {
  var path = require('path');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },
    eslint: {
      src: ['src/**/*.js']
    },
    browserify: {
      kuzzle: {
        src: ['src/kuzzle.js'],
        dest: 'build/kuzzle.js'
      }
    },
    uglify: {
      kuzzle: {
        options: {
          'sourceMap': true,
          'sourceMapName': 'build/kuzzle.min.map',
          'banner': '// This is the Kuzzle SDK version 0.2.0 - Licenced under the Apache 2.0 Licence'
        },
        files: {
          'build/kuzzle.min.js': ['build/kuzzle.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'eslint', 'browserify', 'uglify']);
};
