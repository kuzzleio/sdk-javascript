const
  {
    execute,
    getVersionPath
  } = require('../helpers/utils'),
  fs = require('fs');

class CsharpSdk {
  constructor(version) {
    this.name = 'csharp';
    this.version = version;
    this.versionPath = getVersionPath(this);
    this.sdkCsharpArchive = 'kuzzlesdk-csharp-experimental-amd64.tar.gz';
    this.sdkDir = 'test/bin/';
    this.archiveDir = 'kuzzle-csharp-sdk';
    this.sdkCsharpBucket = `https://dl.kuzzle.io/sdk/csharp/${this.versionPath}/${this.sdkCsharpArchive}`;
    this.sdkFiles = [
      'kuzzlesdk-0.0.1.dll',
      'libkuzzle-wrapper-csharp.dll',
      'libkuzzlesdk.so'
    ];
  }

  async get() {
    this.sdkFiles.forEach(async file => {
      await execute('rm', ['-f' ,`${this.archiveDir}/${file}`], { cwd: this.sdkDir });
    });
    await execute('curl', ['-o', this.sdkCsharpArchive, this.sdkCsharpBucket], { cwd: this.sdkDir });
    await execute('tar', ['-xf', this.sdkCsharpArchive], { cwd: this.sdkDir });
    this.sdkFiles.forEach(async file => {
      await execute('mv', [`${this.archiveDir}/${file}`, '.'], { cwd: this.sdkDir });
    });
    await execute('rm', ['-r', this.archiveDir, this.sdkCsharpArchive], { cwd: this.sdkDir });
  }

  exists() {
    return this.sdkFiles.map(file => {
      return fs.existsSync(`${this.sdkDir}/${file}`);
    }).filter(fileExists => fileExists).length === this.sdkFiles.length;
  }
}

module.exports = CsharpSdk;
