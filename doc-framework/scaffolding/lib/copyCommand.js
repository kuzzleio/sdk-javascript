const
  {
    renderSnippetTemplate,
    renderMarkdownTemplate,
    renderSnippetConfigTemplate,
    explodeSdkPath,
    extractFromFile,
    injectInFile,
    showSignatures
  } = require('./utils'),
  _ = require('lodash');


function injectTemplates(sdkInfos, src, dest) {
  const longDescriptionRegexp = {
    start: `# ${_.camelCase(sdkInfos.action)}\n`,
    end: '## Arguments\n'
  };

  const shortDescriptionRegexp = {
    start: 'description:',
    end: '\n---'
  };

  const argsTableRegexp = {
    start: '## Arguments\n',
    end: '\n###'
  };

  const argsDescriptionRegexp = {
    start: '###',
    end: '\n## R', // match '### Return' or '### Resolve'
    includeStart: true
  };

  // when there is no 'Return' or 'Resolve' section
  const argsDescriptionRegexp2 = {
    start: '###',
    end: '\n## Usage',
    includeStart: true
  };

  const hookAfterRegexp = {
    start: 'after:',
    end: '\ntemplate'
  };

  const hookBeforeRegexp = {
    start: 'before:',
    end: '\n  after'
  };

  const snippetTemplateRegexp = {
    start: 'template:',
    end: '\nexpected'
  };

  const snippetExpectedRegexp = {
    start: 'expected:',
    end: '\n'
  };

  // We extract the needed information from files with regexp
  const
    srcIndexFile = `${src}/index.md`,
    srcTestConfigFile =`${src}/snippets/${_.kebabCase(sdkInfos.action)}.test.yml`,
    destIndexFile = `${dest}/index.md`,
    destTestConfigFile =`${dest}/snippets/${_.kebabCase(sdkInfos.action)}.test.yml`,
    longDescription = extractFromFile(srcIndexFile, longDescriptionRegexp),
    shortDescription = extractFromFile(srcIndexFile, shortDescriptionRegexp),
    argsTable = extractFromFile(srcIndexFile, argsTableRegexp),
    argsDescription = extractFromFile(srcIndexFile, argsDescriptionRegexp, argsDescriptionRegexp2),
    hookAfter = extractFromFile(srcTestConfigFile, hookAfterRegexp),
    hookBefore = extractFromFile(srcTestConfigFile, hookBeforeRegexp),
    snippetTemplate = extractFromFile(srcTestConfigFile, snippetTemplateRegexp),
    snippetExpected = extractFromFile(srcTestConfigFile, snippetExpectedRegexp);

  // Then we inject them in the new files
  injectInFile(destIndexFile, longDescriptionRegexp, longDescription);
  injectInFile(destIndexFile, shortDescriptionRegexp, shortDescription);
  injectInFile(destIndexFile, argsTableRegexp, argsTable);
  injectInFile(destIndexFile, argsDescriptionRegexp, argsDescription);
  injectInFile(destTestConfigFile, hookAfterRegexp, hookAfter);
  injectInFile(destTestConfigFile, hookBeforeRegexp, hookBefore);
  // original shortDescriptionRegexp is meant to extract short description from index.md
  // but we use the short description in the action.test.yml test config file
  injectInFile(destTestConfigFile, { start: shortDescriptionRegexp.start, end: '\nhooks' }, shortDescription);
  injectInFile(destTestConfigFile, snippetTemplateRegexp, snippetTemplate);
  injectInFile(destTestConfigFile, snippetExpectedRegexp, snippetExpected);
}

async function copyCommand (src, dest) {
  if (! src) {
    // eslint-disable-next-line no-console
    console.error('You must provide a source path for the action');
    process.exit(1);
  }

  if (! dest) {
    // eslint-disable-next-line no-console
    console.error('You must provide a destination path for the new action');
    process.exit(1);
  }

  try {
    const sdkInfos = explodeSdkPath(dest);

    await renderMarkdownTemplate(sdkInfos, dest);
    await renderSnippetTemplate(sdkInfos, dest);
    await renderSnippetConfigTemplate(sdkInfos, dest);

    injectTemplates(sdkInfos, src, dest);

    showSignatures(sdkInfos);
  } catch(error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = copyCommand;
