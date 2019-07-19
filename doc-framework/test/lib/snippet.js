const
  fs = require('fs'),
  _ = require('lodash'),
  path = require('path'),
  readYaml = require('read-yaml'),
  indentString = require('indent-string'),
  sanitize = require('sanitize-filename'),
  TestResult = require('./helpers/testResult');

const
  TEMPLATES_DIR = path.join(__dirname, '../templates/'),
  RENDERED_SNIPPETS_DIR = path.join(__dirname, '../bin/'),
  SAVE_FAIL_DIR = path.join(__dirname, '../../reports/failed/'),
  GENERIC_JAVA_CLASSNAME = 'CodeExampleGenericClass';

class Snippet {
  constructor(testFile, sdk) {
    this.testFile = testFile;
    this.sdk = sdk;
  }

  build() {
    this.testDefinition = readYaml.sync(this.testFile);
    if (Object.keys(this.testDefinition).length === 0) {
      const result = {
        code: 'MISSING_TEST_DESCRIPTION',
        actual: 'Missing or empty test.yml file'
      };

      throw new TestResult(result);
    }
    this.name = this.testDefinition.name.replace('#', '');
    this.description = this.testDefinition.description;
    this.expected = this.testDefinition.expected;
    this.template = this.testDefinition.template;
    this.hooks = this.testDefinition.hooks;
    
    const
      runnerName = `${this.testDefinition.runner || this.sdk.name}Runner`,
      Runner = require(`./runners/${runnerName}`);
    
    this.runner = new Runner(this.sdk);

    this.templateFile = `${TEMPLATES_DIR}${this.template}.tpl.${this.runner.ext}`;
    if (! fs.existsSync(this.templateFile)) {
      const result = {
        code: 'MISSING_TEMPLATE',
        actual: `Missing template file: ${this.templateFile}`
      };

      throw new TestResult(result);
    }

    this.snippetFile = this.testFile.replace('.test.yml', `.${this.runner.ext}`);
    if (! fs.existsSync(this.snippetFile)) {
      const result = {
        code: 'MISSING_SNIPPET',
        actual: `Missing snippet file: ${this.snippetFile}`
      };

      throw new TestResult(result);
    }

    this.snippetContent = fs.readFileSync(this.snippetFile, 'utf8');

    // Delete the automatic newline character added by IDE at the end of file
    if (this.snippetContent[this.snippetContent.length - 1] === '\n') {
      this.snippetContent = this.snippetContent.slice(0, -1);
    }

    return this;
  }

  /**
   * Render the snippet code inside the template and write it in file
   *
   */
  render() {
    this.templateContent = fs.readFileSync(this.templateFile, 'utf8');
    if (this.templateContent.indexOf('[snippet-code]') === -1) {
      const result = {
        code: 'MISSING_TAG',
        actual: 'Missing tag [snippet-code]'
      };

      throw new TestResult(result);
    }

    const
      indentedSnippet = this._getIndentedSnippet(),
      snippetName = this._sanitizeFileName(this.name),
      renderedSnippet = this.templateContent.replace(/(\[snippet-code])/g, indentedSnippet);

    this.renderedSnippetPath = `${RENDERED_SNIPPETS_DIR}${snippetName}.${this.runner.ext}`;

    // JAVA hack, because filename has to be the same of the class name
    // We replace the template generique class name by the name of the test
    if (this.runner.ext === 'java') {
      fs.writeFileSync(this.renderedSnippetPath, this._overrideClassName(renderedSnippet, snippetName));
    } else {
      fs.writeFileSync(this.renderedSnippetPath, renderedSnippet);
    }

    if (! fs.existsSync(this.renderedSnippetPath)) {
      const result = {
        code: 'MISSING_GENERATED_FILE',
        actual: `Missing generated file: ${this.renderedSnippetPath}`
      };

      throw new TestResult(result);
    }
  }

  saveRendered() {
    const dest = `${SAVE_FAIL_DIR}${this.name}.${this.runner.ext}`;
    fs.copyFileSync(this.snippetFile, dest);
  }

  getLocalCommand() {
    const name = this.name.toLowerCase();

    switch (this.sdk.name) {
      case 'go':
        return `cp test/bin/${name}.go $GOPATH && cd $GOPATH && go run ${name}.go ; cd -`;
      case 'cpp':
        return `LD_LIBRARY_PATH=./test/bin/sdk-cpp/lib ./test/bin/${name}`;
      case 'java':
        return `java -cp ./test/bin/sdk-java/kuzzlesdk-java-experimental-amd64.jar::./test/bin ${name}`;
      case 'js':
        return `node test/bin/${name}.js`;
      case 'csharp':
        return `LD_LIBRARY_PATH=./test/bin/ mono ./test/bin/${name}.exe`;
      default:
        return `Unknown sdk name ${this.sdk.name}`;
    }
  }

  _getIndentedSnippet() {
    const
      matches = this.templateContent.match(/^.*snippet-code.*$/gm),
      snippetIndentation = matches[0].match(/^\s*/)[0].length,
      firstline = this.snippetContent.split('\n')[0];

    return firstline + indentString(this.snippetContent.replace(firstline, ''), snippetIndentation);
  }

  _sanitizeFileName(fileName) {
    return sanitize(fileName).replace(' ', '_').toLowerCase();
  }

  _overrideClassName(content, name) {
    return content.replace(GENERIC_JAVA_CLASSNAME, name);
  }

}

module.exports = Snippet;
