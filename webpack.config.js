const
  webpack = require('webpack'),
  version = require('./package.json').version;

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'kuzzle.js',
    library: 'KuzzleSDK',
    libraryTarget: 'umd'
  },
  target: 'node',
  watch: false,
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
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader', 'eslint-loader']
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^(http|min-req-promise|package|uws)$/),
    new webpack.DefinePlugin({
      SDKVERSION: JSON.stringify(version),
      BUILT: true
    }),
    new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
};
