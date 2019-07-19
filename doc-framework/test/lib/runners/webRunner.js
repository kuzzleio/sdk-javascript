const
  BaseRunner = require('./baseRunner'),
  path = require('path');

module.exports = class WebRunner extends BaseRunner {
  constructor(sdk) {
    super(sdk);

    this.lintConfig = path.join(__dirname, '../../linters/eslint.json');
    this.lintCommand = './node_modules/.bin/eslint';
    this.lintOptions = ['-c', this.lintConfig];
    this.scriptPath = path.join(__dirname, '../scripts/puppeteer.js');
    this.ext = 'html';
  }

  async runSnippet(snippet) {
    this.snippetCommand = `node ${this.scriptPath} ${snippet.renderedSnippetPath}`;
    await super.runSnippet(snippet);
  }

  async lint(snippet) {
    await super.lint(snippet, this.lintOptions.concat(snippet.renderedSnippetPath));
  }
};
