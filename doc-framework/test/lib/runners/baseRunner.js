const
  fs = require('fs'),
  childProcess = require('child_process'),
  { execute } = require('../helpers/utils'),
  TestResult = require('../helpers/testResult');

module.exports = class BaseRunner {
  constructor(sdk) {
    this.sdk = sdk;
    this.snippetCommand = '';
    this.lintCommand = '';
    this.lintOptions = [];
    this.ext = '';
  }

  async run(snippet) {
    snippet.render();

    try {
      if (snippet.hooks.before) {
        await this.runHookCommand(snippet.hooks.before);
      }

      await this.lint(snippet);
      await this.runSnippet(snippet);
    } catch (e) {
      // Save renderedSnippet to display it in the web view
      snippet.saveRendered();

      e.file = snippet.snippetFile.split('src/')[1];

      throw e;
    } finally {
      if (snippet.hooks.after) {
        await this.runHookCommand(snippet.hooks.after);
      }
    }
  }

  async runSnippet(snippet) {
    return new Promise((resolve, reject) => {
      childProcess.exec(this.snippetCommand, (error, stdout, stderr) => {
        const output = stdout.split('\n').concat(stderr.split('\n'));

        if (error) {
          const res = {
            code: 'ERR_ASSERTION',
            actual: error.actual || error,
            output: stdout
          };

          reject(new TestResult(res));
          return;
        }

        const
          expected = Array.isArray(snippet.expected) ? snippet.expected : [snippet.expected];

        let
          lastIndex = 0,
          previous = null;

        for (const e of expected) {
          let
            match = null,
            index;

          for (index = lastIndex; index < output.length && match === null; index++) {
            match = output[index].match(e);
          }

          if (match === null) {
            // check if the looked up item is actually before a previous
            // one
            if (previous !== null) {
              for(let i = 0; i < lastIndex && match === null; i++) {
                match = output[i].match(e);
              }
            }

            if (match !== null) {
              return reject(new TestResult({
                code: 'ERR_ORDER',
                actualOrder: [previous, e],
                actual: output
              }));
            }

            return reject(new TestResult({
              code: 'ERR_ASSERTION',
              expected: e,
              actual: output
            }));
          }

          lastIndex = index;
          previous = e;
        }

        return resolve();
      });
    });
  }

  async lint(snippet, lintOptions) {
    try {
      await execute(this.lintCommand, lintOptions);
    } catch (e) {
      const result = {
        code: 'ERR_LINTER',
        actual: e.message
      };

      throw new TestResult(result);
    }
  }

  runHookCommand(command) {
    return new Promise((resolve, reject) => {
      childProcess.exec(command, { stderr: 'ignore', stdio: 'ignore' }, error => {
        if (error) {
          const result = {
            code: 'HOOK_FAILED',
            actual: error.message
          };

          return reject(new TestResult(result));
        }

        resolve();
      });
    });
  }

  clean(snippet) {
    fs.unlinkSync(snippet.renderedSnippetPath);
  }
};
