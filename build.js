const
  webpack = require('webpack'),
  webpackConfig = require('./webpack.config.js');

process.env.NODE_ENV = 'production';

function webpackcb(err, stats) {
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
}

for (const target of webpackConfig) {
  webpack(target, webpackcb);
}
