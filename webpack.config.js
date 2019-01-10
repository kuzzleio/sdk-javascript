const
  webpack = require('webpack'),
  version = require('./package.json').version;

module.exports = {
  name: 'browser',
  mode: 'production',
  entry: './index.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'kuzzle.js',
    library: {
      root: 'KuzzleSDK',
      amd: 'kuzzle-sdk',
      commonjs: 'kuzzle-sdk'
    }
    libraryTarget: 'umd'
  },
  target: 'web',
  watch: false,
  devtool: 'source-map',
  node: false,
  module: {
    rules: [
      {
        test: /\.?js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.?js$/,
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
};
