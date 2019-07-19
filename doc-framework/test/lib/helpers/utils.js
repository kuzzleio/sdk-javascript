const
  readYaml = require('read-yaml'),
  path = require('path'),
  { spawnSync } = require('child_process');

const SDK_VERSIONS_PATH = path.join(__dirname, '../../sdk-versions.yml');

async function execute(command, args, options = {}) {
  options.encoding = 'utf8';

  const { status, output, error } = spawnSync(command, args, options);

  if (error) {
    throw error;
  }

  if (status !== 0) {
    const message = output.join('\n');

    throw new Error(message);
  }

  return status;
}

function getVersionPath(sdk) {
  const sdkVersions = readYaml.sync(SDK_VERSIONS_PATH);
  const supportedSdks = getSupportedSdks(sdkVersions);

  if (! supportedSdks.includes(sdk.name)) {
    throw new Error(`Unknown SDK ${sdk.name}. Supported SDKs: ${supportedSdks.join(', ')}`);
  }

  const sdkVersionPath = sdkVersions[sdk.name][sdk.version];
  if (! sdkVersionPath) {
    throw new Error(`Unknown version ${sdk.version} for ${sdk.name} SDK.`);
  }

  return sdkVersionPath;
}

function getSupportedSdks(sdkVersions = null) {
  if (! sdkVersions) {
    sdkVersions = readYaml.sync(SDK_VERSIONS_PATH);
  }

  return Object.keys(sdkVersions);
}

module.exports = {
  execute,
  getVersionPath,
  getSupportedSdks
};
