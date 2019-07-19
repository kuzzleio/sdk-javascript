const { execute, getVersionPath } = require('../helpers/utils'),
  fs = require('fs');

class JsSdk {
  constructor(version) {
    this.name = 'js';
    this.version = version;

    this.npmPackage = `https://github.com/kuzzleio/sdk-javascript#${getVersionPath(
      this
    )}`;
    this.sdkDir = 'node_modules/kuzzle-sdk';
  }

  async get() {
    await execute('npm', ['install', '--no-save', this.npmPackage, 'mqtt']);
  }

  exists() {
    const packageFile = `${this.sdkDir}/package.json`;

    if (!fs.existsSync(this.sdkDir) || !fs.existsSync(packageFile)) {
      return false;
    }

    const versionString = JSON.parse(fs.readFileSync(packageFile))._id;

    if (
      !versionString ||
      !versionString.includes(`kuzzle-sdk@${this.version}`)
    ) {
      return false;
    }

    return true;
  }
}

module.exports = JsSdk;
