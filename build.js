// https://github.com/shelljs/shelljs
// var path = require('path');
var ora = require('ora');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var spinner = ora('building for production...');

// require('shelljs/global');
process.env.NODE_ENV = 'production';

spinner.start();

// var assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory)
// rm('-rf', assetsPath)
// mkdir('-p', assetsPath)
// cp('-R', 'static/', assetsPath)

webpack(webpackConfig, function (err, stats) {
  spinner.stop();
  if (err) {
    throw err;
  }
  process.stdout.write(stats.toString({
    colors: true,
    modules: true,
    children: true,
    chunks: true,
    chunkModules: true
  }) + '\n');
});
