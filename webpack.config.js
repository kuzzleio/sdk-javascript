const
  path = require('path'),
  webpack = require('webpack'),
  version = require('./package.json').version;

module.exports = [
  {
    name: 'browser',
    mode: 'production',
    entry: './index.js',
    output: {
      path: `${__dirname}/dist`,
      filename: 'kuzzle.js',
      library: 'kuzzle-sdk',
      libraryTarget: 'window'
    },
    target: 'web',
    watch: false,
    devtool: 'source-map',
    node: false,
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, 'babel.browsers.js')
            }
          }
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/^(http|min-req-promise|package|ws)$/),
      new webpack.DefinePlugin({
        SDKVERSION: JSON.stringify(version),
        BUILT: true
      }),
      new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
      new webpack.optimize.OccurrenceOrderPlugin()
    ]
  },
  {
    name: 'node/react',
    mode: 'production',
    entry: './index.js',
    output: {
      path: `${__dirname}/dist`,
      filename: 'kuzzle.node.js',
      library: 'KuzzleSDK',
      libraryTarget: 'umd'
    },
    optimization: {
      minimize: false
    },
    target: 'node',
    watch: false,
    devtool: 'source-map',
    node: false,
    module: {
      rules: [
        {
          test: /\.m?js$/,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, 'babel.node.js')
            }
          }
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/^(bufferutil|utf-8-validate)$/),
      new webpack.DefinePlugin({
        SDKVERSION: JSON.stringify(version),
        BUILT: true
      }),
      new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
      new webpack.optimize.OccurrenceOrderPlugin()
    ]
  }
];
