const
  fs = require('fs'),
  { execute } = require('../helpers/utils'),
  BaseRunner = require('./baseRunner'),
  TestResult = require('../helpers/testResult');

module.exports = class CppRunner extends BaseRunner {
  constructor(sdk) {
    super(sdk);
    this.compileOptions = ['-std=c++11', `-I${this.sdk.sdkDir}/include`, `-L${this.sdk.sdkDir}/lib`, '-lkuzzlesdk', '-lpthread'];
    this.lintCommand = 'cpplint';
    this.lintOptions = ['--filter=-legal/copyright,-whitespace/line_length'];
    this.executablePath = '';
    this.ext = 'cpp';
  }

  async runSnippet(snippet) {
    process.env.LD_LIBRARY_PATH = `./${this.sdk.sdkDir}/lib`;
    this.snippetCommand = snippet.renderedSnippetPath.split('.')[0];

    try {
      await execute('g++', this.compileOptions.concat(['-o', this.snippetCommand, snippet.renderedSnippetPath]));
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
    await super.lint(snippet, this.lintOptions.concat(snippet.renderedSnippetPath));
  }

  clean(snippet) {
    super.clean(snippet);
    fs.unlinkSync(this.snippetCommand);
  }
};
