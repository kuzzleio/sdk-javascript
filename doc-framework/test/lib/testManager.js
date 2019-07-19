const
  fs = require('fs'),
  path = require('path'),
  readYaml = require('read-yaml'),
  Snippet = require('./snippet'),
  Logger = require('./helpers/logger'),
  {
    getSupportedSdks,
    getVersionPath
  } = require('./helpers/utils'),
  TestResult = require('./helpers/testResult');

class TestManager {
  constructor(sdk, version, sdkPath) {
    const supportedSdks = getSupportedSdks();
    if (! supportedSdks.includes(sdk)) {
      throw new Error(`Unknown SDK ${sdk}. Supported SDKs: ${supportedSdks.join(', ')}`);
    }

    this.basePath = sdkPath;

    const Sdk = require(`./sdk/${sdk}Sdk`);
    this.sdk = new Sdk(version);

    this.logger = new Logger(this.sdk);

    this.collection = `${this.sdk.name}-${this.sdk.version}`;

    this.results = [];

    this.snippets = [];
  }

  crawlSnippets () {
    this.snippets = this._crawl(this.basePath).filter(snippet => {
      const { sdk, version } = readYaml.sync(snippet);

      return sdk === this.sdk.name && version.toString() === this.sdk.version;
    });

    this.logger.log(`Found ${this.snippets.length} snippets.\n`);
  }

  async runSnippets () {
    for (const snippetPath of this.snippets) {
      await this.runSnippet(snippetPath);
    }

    this.logger.writeReport();

    if (this.results.filter(result => result.code !== 'SUCCESS').length > 0) {
      process.exit(1);
    }
  }

  async runSnippet (snippetPath) {
    const snippet = new Snippet(snippetPath, this.sdk);

    try {
      snippet.build();

      await snippet.runner.run(snippet);

      this.results.push({
        code: 'SUCCESS',
        file: snippet.snippetFile
      });

      await snippet.runner.clean(snippet);
    } catch (e) {
      if (! (e instanceof TestResult)) {
        this.results.push(new TestResult({
          code: 'ERROR',
          actual: e
        }));
      } else {
        this.results.push(e);
      }
    } finally {
      this.logger.reportResult(snippet, this.results[this.results.length - 1]);
    }
  }

  _crawl (base) {
    if (fs.statSync(base).isFile() && base.indexOf('.test.yml') > -1) {
      return [base];
    }

    let result = [];

    const files = fs.readdirSync(base);

    for (const file of files) {
      const newbase = path.join(base, file);

      if (fs.statSync(newbase).isDirectory()) {
        result = result.concat(this._crawl(newbase));
      } else if (file.indexOf('.test.yml') > -1) {
        result.push(newbase);
      }
    }

    return result;
  }

  async downloadSdk() {
    if (process.env.DEV_MODE === 'true' && this.sdk.exists()) {
      this.logger.log('DEV_MODE is true, sdk already exists, skipping download');
      return;
    }

    this.logger.log(`Install ${this.sdk.name.toUpperCase()} SDK version ${this.sdk.version} from ${getVersionPath(this.sdk)}`);

    try {
      await this.sdk.get();
      this.logger.log('Installation successfull', true);
    } catch (e) {
      this.logger.log(`Error when installing the SDK: ${e.message}`, false);

      throw e;
    }
  }
}

module.exports = TestManager;
