const
  {
    execute,
    getVersionPath
  } = require('../helpers/utils'),
  fs = require('fs');

class GoSdk {
  constructor(version) {
    this.name = 'go';
    this.version = version;

    this.repository = 'https://github.com/kuzzleio/sdk-go';
    this.sdkDir = '/go/src/github.com/kuzzleio/sdk-go';
  }

  async get() {
    await execute('git', ['clone', '-b', getVersionPath(this), this.repository]);
    await execute('mv', ['sdk-go', this.sdkDir]);
    await execute('go', ['get', './...'], { cwd: this.sdkDir });
  }

  exists() {
    // Can't check if sdk go exist because we can't download it in test/bin, thanks to the GO_PATH
    return false;
  }
}

module.exports = GoSdk;
