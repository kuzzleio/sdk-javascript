const
  fs = require('fs'),
  path = require('path'),
  BaseRunner = require('./baseRunner');

module.exports = class JavaTester extends BaseRunner {
  constructor(sdk) {
    super(sdk);
    this.runCommand = `java -cp ./${this.sdk.sdkDir}/kuzzlesdk-java-experimental-amd64.jar:./test/bin`;
    this.lintCommand = 'javac';
    this.lintOptions = ['-cp', `${this.sdk.sdkDir}/kuzzlesdk-java-experimental-amd64.jar`];
    this.ext = 'java';    
  }

  async runSnippet(snippet) {
    const generatedFilename = path.basename(snippet.renderedSnippetPath, '.java');
    this.snippetCommand = `${this.runCommand} ${generatedFilename}`;

    await super.runSnippet(snippet);
  }

  async lint(snippet) {
    await super.lint(snippet, this.lintOptions.concat(snippet.renderedSnippetPath));
  }

  clean(snippet) {
    super.clean(snippet);
    fs.unlinkSync(snippet.renderedSnippetPath.replace('.java', '.class'));
  }
};
