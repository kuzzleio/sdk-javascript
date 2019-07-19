const
  {
    execute,
    getVersionPath
  } = require('../helpers/utils'),
  fs = require('fs');

class CppSdk {
  constructor(version) {
    this.name = 'cpp';
    this.version = version;
    this.versionPath = getVersionPath(this);
    this.sdkCppArchive = 'kuzzlesdk-cpp-experimental-amd64.tar.gz';
    this.sdkDir = 'test/bin/sdk-cpp';
    this.archiveDir = 'kuzzle-cpp-sdk';
    this.sdkCppBucket = `https://dl.kuzzle.io/sdk/cpp/${this.versionPath}/${this.sdkCppArchive}`;
  }

  async get() {
    await execute('rm', ['-rf', this.sdkDir]);
    await execute('mkdir', ['-p', this.sdkDir]);
    await execute('curl', ['-o', this.sdkCppArchive, this.sdkCppBucket], { cwd: this.sdkDir });
    await execute('tar', ['-xf', this.sdkCppArchive], { cwd: this.sdkDir });
    await execute('mv', [`${this.archiveDir}/include`, `${this.archiveDir}/lib`, '.'], { cwd: this.sdkDir });
    await execute('rm', ['-r', this.archiveDir, this.sdkCppArchive], { cwd: this.sdkDir });
  }

  exists() {
    return fs.existsSync(this.sdkDir);
  }
}

module.exports = CppSdk;
