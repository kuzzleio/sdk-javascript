const
  ora = require('ora'),
  webpack = require('webpack'),
  webpackConfig = require('./webpack.config.js'),
  spinner = ora('Building SDK...');

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
