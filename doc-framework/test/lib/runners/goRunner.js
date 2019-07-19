const
  BaseRunner = require('./baseRunner'),
  { execute } = require('../helpers/utils'),
  TestResult = require('../helpers/testResult');

module.exports = class GoRunner extends BaseRunner {
  constructor(sdk) {
    super(sdk);
    this.goProjectPath = '/go/src/github.com/kuzzleio/go-test/';
    this.lintCommand = 'golint';
    this.ext = 'go';
  }

  async runSnippet(snippet) {
    const fileName = snippet.renderedSnippetPath.split('/').pop();
    this.snippetCommand = `go run ${this.goProjectPath}${fileName}`;

    try {
      await execute('goimports', ['-w', `${this.goProjectPath}${fileName}`]);
    } catch (e) {
      const res = {
        code: 'COMPILATION_FAIL',
        actual: e.message
      };
      throw new TestResult(res);
    }

    await super.runSnippet(snippet);
  }

  async lint(snippet) {
    const fileName = snippet.renderedSnippetPath.split('/').pop();

    await super.lint(snippet, [this.goProjectPath + fileName]);
  }
};
