var
  path = require('path'),
  webpack = require('webpack');

module.exports = function(grunt) {
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ['src/**/*.js']
    },
    browserify: {
      kuzzle: {
        src: ['src/kuzzle.js'],
        dest: 'dist/browsers/kuzzle.js',
        options: {
          exclude: ['./src/networkWrapper/wrappers/wsnode.js'],
          browserifyOptions: {
            noParse: [require.resolve('node-uuid')]
          }
        }
      }
    },
    webpack: {
      kuzzle: {
        entry: './src/kuzzle.js',
        output: {
          path: './dist/webpack',
          filename: 'kuzzle.js',
          libraryTarget: 'umd'
        },
        watch: false,
        debug: false,
        devtool: 'source-map',
        node: {
          console: false,
          global: false,
          process: false,
          Buffer: false,
          __filename: false,
          __dirname: false,
          setImmediate: false
        },
        plugins: [
          new webpack.IgnorePlugin(/wsnode/),
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.DefinePlugin({
            global: "window"
          }),
          new webpack.optimize.UglifyJsPlugin({
            compressor: {
              warnings: false
            }
          })
        ]
      }
    },
    uglify: {
      kuzzle: {
        options: {
          'sourceMap': true,
          'sourceMapName': 'dist/browsers/kuzzle.min.map',
          'banner': '// <%= pkg.description %> v<%= pkg.version %> - License: <%= pkg.license %>'
        },
        files: {
          'dist/browsers/kuzzle.min.js': ['dist/browsers/kuzzle.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['eslint', 'browserify', 'webpack', 'uglify']);
};

