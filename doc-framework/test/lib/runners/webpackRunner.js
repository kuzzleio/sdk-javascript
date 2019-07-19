const BaseRunner = require('./baseRunner'),
  path = require('path'),
  // webpack and html-webpack-plugin are globally installed in the container
  webpack = require('/usr/local/lib/node_modules/webpack'),
  HtmlWebpackPlugin = require('/usr/local/lib/node_modules/html-webpack-plugin');

async function buildWithWebpack(snippet) {
  const config = {
    entry: [
      snippet.renderedSnippetPath
    ],
    output: {
      path: path.resolve(
        __dirname,
        '..',
        '..',
        'bin',
        'sdk-js',
        'webpack',
        snippet.name
      ),
      filename: 'build.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: { chrome: 58 }
                }]
              ],
            }
          }
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
}

module.exports = class WebpackRunner extends BaseRunner {
  constructor(sdk) {
    super(sdk);

    this.lintConfig = path.join(__dirname, '../../linters/eslint.json');
    this.lintCommand = './node_modules/.bin/eslint';
    this.lintOptions = ['-c', this.lintConfig];
    this.puppeteerPath = path.join(__dirname, '../scripts/puppeteer.js');
    this.ext = 'js';
  }

  async runSnippet(snippet) {
    await buildWithWebpack(snippet);

    const indexHtmlPath = path.join(
      __dirname,
      '..',
      '..',
      'bin',
      'sdk-js',
      'webpack',
      snippet.name,
      'index.html'
    );
    this.snippetCommand = `node ${this.puppeteerPath} ${indexHtmlPath}`;
    await super.runSnippet(snippet);
  }

  async lint(snippet) {
    await super.lint(
      snippet,
      this.lintOptions.concat(snippet.renderedSnippetPath)
    );
  }
};
