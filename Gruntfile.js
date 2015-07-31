module.exports = function(grunt) {
  var path = require('path');

  grunt.loadNpmTasks("grunt-jsbeautifier");

  grunt.initConfig({
    "jsbeautifier": {
      files: ["./index.js","./config.js","./examples/**/*.js",
      "!**/node_modules/**","!**/bluebird.js ","!**/require.js"
      ],
      options: {
        js: {
          indentChar: " ",
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false
        }
      }
    }
  });

  grunt.registerTask('default', ["jsbeautifier"]);
};
