var
  webpack = require('webpack'),
  path = require('path'),
  version = require('./package.json').version;

module.exports = {
  entry: './src/Kuzzle.js',
  output: {
    path: './dist',
    filename: 'kuzzle.js',
    library: 'Kuzzle',
    libraryTarget: 'umd'
  },
  watch: false,
  debug: false,
  devtool: 'source-map',
  node: {
    console: false,
    global: true,
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
        loader: 'eslint-loader',
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
      global: 'window',
      SDKVERSION: JSON.stringify(version),
      BUILT: true
    }),
    new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
};
