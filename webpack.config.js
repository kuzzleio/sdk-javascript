const
  webpack = require('webpack'),
  path = require('path'),
  version = require('./package.json').version;

module.exports = {
  mode: 'production',
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
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          only: [/^src/],
          presets: [
            ['env', {
              debug: true,
              modules: false
            }]]
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
    new webpack.IgnorePlugin(/^(http|min-req-promise|package|uws)$/),
    new webpack.DefinePlugin({
      SDKVERSION: JSON.stringify(version)
    }),
    new webpack.BannerPlugin('Kuzzle javascript SDK version ' + version),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
};
