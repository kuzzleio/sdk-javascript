module.exports = function(grunt) {
  var path = require('path');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.initConfig({
    jsbeautifier: {
      files: ['./index.js','./config.js','./examples/**/*.js',
      '!**/node_modules/**','!**/bluebird.js ','!**/require.js'
      ],
      options: {
        js: {
          indentChar: ' ',
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'tests/**/*.js', 'features/**/*.js']
    },
    eslint: {
      src: ['lib/**/*.js', 'examples/**/*.js', '!examples/amd/require.js', '!examples/lib/*']
    },
    uglify: {
      kuzzle: {
        options: {
          'sourceMap': true, 
          'sourceMapName': 'kuzzle.min.map',
          'banner': '// This is the Kuzzle SDK version 0.2.0 - Licenced under the Apache 2.0 Licence'
        },
        files: {
          './kuzzle.min.js': ['./lib/kuzzle.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'eslint', 'uglify']);
};
