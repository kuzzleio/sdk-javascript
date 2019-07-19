const
  {
    execute,
    getVersionPath
  } = require('../helpers/utils'),
  fs = require('fs');

class JavaSdk {
  constructor(version) {
    this.name = 'java';
    this.version = version;
    this.versionPath = getVersionPath(this);
    this.sdkJavaJar = 'kuzzlesdk-java-experimental-amd64.jar';
    this.sdkDir = 'test/bin/sdk-java';
    this.sdkJavaBucket = `https://dl.kuzzle.io/sdk/java/${this.versionPath}/${this.sdkJavaJar}`;
  }

  async get() {
    await execute('mkdir', ['-p', this.sdkDir]);
    await execute('rm', ['-rf', this.sdkJavaJar], { cwd: this.sdkDir });
    await execute('curl', ['-o', this.sdkJavaJar, this.sdkJavaBucket], { cwd: this.sdkDir });
  }

  exists() {
    return fs.existsSync(this.sdkDir);
  }
}

module.exports = JavaSdk;
