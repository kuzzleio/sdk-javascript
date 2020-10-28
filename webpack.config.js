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
    library: 'KuzzleSDK',
    libraryTarget: 'umd'
  },
  target: 'web',
  watch: false,
  devtool: 'cheap-module-source-map',
  node: false,
  module: {
    rules: [
      {
        test: /\.?js$/,
        use: {
          loader: 'babel-loader'
        }
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
  ],
  resolve: {
    fallback: {
      buffer: require.resolve('buffer'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url/'),
    }
  },
};
