const
  BaseRunner = require('./baseRunner'),
  path = require('path'),
  { execute } = require('../helpers/utils'),
  TestResult = require('../helpers/testResult');

module.exports = class JsRunner extends BaseRunner {
  constructor(sdk) {
    super(sdk);

    this.lintConfig = path.join(__dirname, '../../linters/eslint.json');
    this.lintCommand = './node_modules/.bin/eslint';
    this.lintOptions = ['-c', this.lintConfig];
    this.ext = 'js';
  }

  async runSnippet(snippet) {
    this.snippetCommand = `node ${snippet.renderedSnippetPath}`;

    await super.runSnippet(snippet);
  }

  async lint(snippet) {
    await super.lint(snippet, this.lintOptions.concat(snippet.renderedSnippetPath));
  }
};
