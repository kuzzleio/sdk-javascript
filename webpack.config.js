const
  webpack = require('webpack'),
  path = require('path'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  version = require('./package.json').version;

module.exports = {
  mode: "production",
  entry: './src/Kuzzle.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'kuzzle.js',
    library: 'Kuzzle',
    libraryTarget: 'umd'
  },
  watch: false,
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
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './src/networkWrapper/protocols/'),
          path.resolve(__dirname, './src/Kuzzle.js'),
          path.resolve(__dirname, './src/Room.js'),
          path.resolve(__dirname, './src/eventEmitter/'),
          path.resolve(__dirname, './src/SearchResult.js')
        ],
        loader: 'babel-loader',
        query: {
          presets: ['env']
        }
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        include: path.resolve(__dirname, './src/'),
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.IgnorePlugin(/uws/),
    new webpack.DefinePlugin({
      global: 'window',
      SDKVERSION: JSON.stringify(version),
      BUILT: true
    }),
    new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new UglifyJsPlugin({
      sourceMap: true
    }),
  ]
};
