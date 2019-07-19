const
  {
    green,
    red,
    blue,
    yellow
  } = require('colors/safe'),
  jsonfile = require('jsonfile'),
  path = require('path'),
  fs = require('fs');

/* eslint-disable no-console */

class Logger {
  constructor(sdk) {
    this.sdk = sdk;

    this.reportFile = `${path.join(__dirname, '../../../reports/')}report.json`;

    this.report = {};

    if (fs.existsSync(this.reportFile)) {
      try {
        this.report = jsonfile.readFileSync(this.reportFile);
      } catch (e) {
        if (! (e instanceof SyntaxError)) {
          throw e;
        }
      }
    }
  }

  addToReport(snippet, result) {
    // Do not display this warning locally because we often run the tests multiple time
    if (this.report[snippet.name] && process.env.TRAVIS) {
      console.log(
        yellow('/!\\'),
        ` Duplicate snippet name: ${snippet.name}`
      );
    }

    let status;

    switch (result.code) {
      case 'SUCCESS':
        status = 'Success';
        break;
      default:
        status = 'Fail';
        break;
    }

    this.report[snippet.name] = {
      status,
      language: snippet.language,
      test: snippet.testDefinition,
      datetime: new Date().toLocaleString(),
      error: result.code !== 'SUCCESS' ? { code: result.code, got: result.actual } : {},
      file: (typeof result.file !== 'undefined') ? result.file : ''
    };
  }

  writeReport() {
    jsonfile.writeFileSync(this.reportFile, this.report);
  }

  reportResult(snippet, result) {
    switch (result.code) {
      case 'SUCCESS':
        console.log(
          blue(`[${this.sdk.name}] `),
          green('✔'),
          green(`${snippet.name}: ${snippet.description}`)
        );
        break;
      default:
        console.log(
          blue(`[${this.sdk.name}] `),
          red('✗'),
          red(`${snippet.name}: ${snippet.description}`)
        );
        console.log(red('        CODE    :'), result.code);
        console.log(red('        FILE    :'), result.file);
        if (result.code === 'ERR_ASSERTION') {
          if (result.output && result.output.length > 0) {
            console.log(red('        OUTPUT  :'), result.output);
          }
          console.log(red('        EXPECTED:'), result.expected || snippet.expected);
          console.log(red('        GOT     :'), result.actual);
        } else if (result.code === 'ERR_ORDER') {
          console.log(red('        THIS RESULT: '), result.actualOrder[0]);
          console.log(red('        CAME BEFORE: '), result.actualOrder[1]);
          console.log(red('        COMPLETE OUTPUT: '), result.actual);
        } else {
          console.log(red('        ERROR   :'), result.actual);
        }

        console.log(
          blue(`[${this.sdk.name}] `),
          'Check linter error:',
          `cat -n test/bin/${snippet.name.toLowerCase()}.${snippet.runner.ext} | less`
        );

        console.log(
          blue(`[${this.sdk.name}] `),
          'Run snippet:',
          snippet.getLocalCommand()
        );
        break;
    }

    this.addToReport(snippet, result);
  }

  log(message, status) {
    const statusMessage = (() => {
      switch (status) {
        case true:
          return green('✔');
        case false:
          return red('✗');
        default:
          return '';
      }
    })();

    console.log(
      blue(`[${this.sdk.name}] `),
      message,
      statusMessage
    );
  }
}

module.exports = Logger;
