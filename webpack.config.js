var
  webpack = require('webpack'),
  path = require('path'),
  version = require('./package.json').version;

module.exports = {
  entry: './src/kuzzle.js',
  output: {
    path: './dist',
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
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: path.resolve(__dirname, './src/'),
        exclude: /node_modules/
      }
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/ws/),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      global: 'window'
    }),
    new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
};
