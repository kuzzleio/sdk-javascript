const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const build = async file => {
  const config = {
    entry: file,
    output: {
      path: path.resolve('/tmp', path.basename(file).replace(/\.[^.]+$/, '')),
      filename: 'build.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader'
        }
      ]
    },
    devtool: 'eval-source-map',
    plugins: [new HtmlWebpackPlugin()]
  };

  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        if (err.details) {
          return reject(err.details);
        }
        return reject(err.stack || err);
      }
      const info = stats.toJson();

      if (stats.hasErrors()) {
        return reject(info.errors);
      }

      if (stats.hasWarnings()) {
        return resolve(info.warnings);
      }
      resolve(true);
    });
  });
};

(async () => {
  try {
    await build(process.argv[2]);
  } catch (e) {
    console.error(e);
    throw e;
  }
})();
