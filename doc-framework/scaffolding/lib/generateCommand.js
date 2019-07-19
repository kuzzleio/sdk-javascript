const
  {
    explodeSdkPath,
    renderSnippetTemplate,
    renderMarkdownTemplate,
    renderSnippetConfigTemplate,
    injectSignatures,
    injectDescription
  } = require('./utils'),
  _ = require('lodash'),
  path = require('path');

async function generateCommand (actionPath) {
  if (! actionPath) {
    // eslint-disable-next-line no-console
    console.error('You must provide a path for the action');
    process.exit(1);
  }

  try {
    const sdkInfos = explodeSdkPath(actionPath);

    console.log(`Scaffolding: ${sdkInfos.controller}:${sdkInfos.action} (${sdkInfos.language}/${sdkInfos.version})`);

    await renderMarkdownTemplate(sdkInfos, actionPath);
    await renderSnippetTemplate(sdkInfos, actionPath);
    await renderSnippetConfigTemplate(sdkInfos, actionPath);

    injectDescription(sdkInfos, actionPath);
    injectSignatures(sdkInfos, actionPath);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = generateCommand;
