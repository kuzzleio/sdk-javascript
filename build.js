var ora = require('ora');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var spinner = ora('Building SDK for browser use...');

process.env.NODE_ENV = 'production';

spinner.start();

webpack(webpackConfig, function (err, stats) {
  spinner.stop();
  if (err) {
    throw err;
  }
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n');
});
