const
  fs = require('fs'),
  ejs = require('ejs'),
  _ = require('lodash'),
  { exec } = require('child_process'),
  path = require('path');


const TEMPLATES_PATH = path.join(
  path.dirname(require.main.filename),
  'templates'
);


function mkdirp (fullPath) {
  const parts = fullPath.split(path.sep);

  if (parts.length > 1) {
    mkdirp(parts.slice(0, parts.length - 1).join('/'));
  }

  if (! fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
}

async function renderTemplate(source, destination, variables) {
  if (fs.existsSync(destination)) {
    throw new Error(`${destination} already exists.`);
  }

  const locals = Object.assign({}, { _ }, variables);

  mkdirp(path.dirname(destination));

  return new Promise((resolve, reject) => {
    ejs.renderFile(source, locals, {}, (error, output) => {
      if (error) {
        reject(error);
        return;
      }

      fs.writeFileSync(destination, output);
      resolve();
    });
  });
}

/* EXPORTED FUNCTIONS =====================================================   */

function injectDescription({ action, controller }, actionPath) {
  const actionFile = `./src/api/1/controller-${_.kebabCase(controller)}/${_.kebabCase(action)}/index.md`;

  if (! fs.existsSync(actionFile)) {
    console.error(`Cannot find the corresponding action file ${actionFile}`);
    return;
  }

  const
    content = fs.readFileSync(actionFile, 'utf8'),
    regexp = new RegExp(`# ${_.camelCase(action)}\\n([\\s\\S]+?)---`),
    result = content.match(regexp);

  if (!result) {
    console.log('Cannot extract the action description :(');
    return;
  }

  const
    dest = `${actionPath}/index.md`,
    template = {
      start: `# ${_.camelCase(action)}\n`,
      end: '## Arguments\n'
    };

  injectInFile(dest, template, result[1]);
}

function injectSignatures({ language, action, controller }, actionPath) {
  const
    dest = `${actionPath}/index.md`,
    template = {
      start: `\`\`\`${language}\n`,
      end: '\n```'
    },
    inject = (error, stdout, stderr) => {
      if (error) {
        console.log(error.message);
        console.error(stderr);
        return;
      }

      injectInFile(dest, template, stdout);
    };

  switch (language) {
    case 'js':
      exec(`find node_modules/kuzzle-sdk/src/controllers -name "*.js" | grep ${controller} | xargs cat | grep '${_.camelCase(action)} ('`, inject);
      break;

    case 'cpp':
      exec(`cat test/bin/sdk-cpp/include/${controller}.hpp | grep ${_.camelCase(action)}`, inject);
      break;

    case 'java':
      exec(`javap -classpath test/bin/sdk-java/kuzzlesdk-amd64.jar io.kuzzle.sdk.${_.upperFirst(_.camelCase(controller))} | grep ${_.camelCase(action)}`, inject);
      break;

    case 'go':
      exec(`grep '${_.upperFirst(_.camelCase(action))}(' ${process.env.GOPATH}/src/github.com/kuzzleio/sdk-go/${controller}/${_.camelCase(action)}.go`, inject);
      exec(`grep '${_.upperFirst(_.camelCase(action))}(' ${process.env.GOPATH}/src/github.com/kuzzleio/sdk-go/${controller}/${_.snakeCase(action)}.go`, inject);
      break;
  }

}

function renderMarkdownTemplate(variables, actionPath) {
  const
    actionTemplate = path.join(TEMPLATES_PATH, `action.${variables.language}.md`),
    destinationFile = path.join(actionPath, 'index.md');

  return renderTemplate(actionTemplate, destinationFile, variables);
}

function renderSnippetTemplate(variables, actionPath) {
  const
    snippetTemplate = path.join(TEMPLATES_PATH, 'usage-snippets',`usage.${variables.language}`),
    destinationFile = path.join(actionPath, 'snippets', `${_.kebabCase(variables.action)}.${variables.language}`);

  return renderTemplate(snippetTemplate, destinationFile, variables);
}

function renderSnippetConfigTemplate(variables, actionPath) {
  const
    snippetTemplate = path.join(TEMPLATES_PATH, 'usage-snippets','usage.test.yml'),
    destinationFile = path.join(actionPath, 'snippets', `${_.kebabCase(variables.action)}.test.yml`);

  return renderTemplate(snippetTemplate, destinationFile, variables);
}

function extractFromFile(file, regexpInfo, regexpInfoFallback) {
  if (!fs.existsSync(file)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  let regexp;

  for (const regInfo of [regexpInfo, regexpInfoFallback]) {
    if (! regInfo) {
      continue;
    }

    if (regInfo.includeStart) {
      regexp = new RegExp(`(${regInfo.start}[\\s\\S]*)${regInfo.end}`);
    } else {
      regexp = new RegExp(`${regInfo.start}([\\s\\S]*)${regInfo.end}`);
    }

    const result = content.match(regexp) || [];

    if (result.length > 0) {
      return result[1];
    }
  }

  throw new Error(`No match found in ${file} for ${regexp}`);
}

function injectInFile(file, regexpInfo, injectedContent) {
  if (! injectedContent) {
    return;
  }

  const
    content = fs.readFileSync(file, 'utf8'),
    regexp = new RegExp(`${regexpInfo.start}([\\s\\S]*)${regexpInfo.end}`),
    newContent = content.replace(regexp, `${regexpInfo.start}${injectedContent}${regexpInfo.end}`);

  fs.writeFileSync(file, newContent);
}

function explodeSdkPath(fullPath) {
  const [
    language,
    version,
    controller,
    action,
    rest
  ] = (fullPath.split('sdk-reference/')[1] || '').split('/');

  if (! language) {
    // eslint-disable-next-line no-console
    throw new Error('You must provide a language for the action');
  }

  if (! version) {
    // eslint-disable-next-line no-console
    throw new Error('You must provide a version for the action');
  }

  if (! controller) {
    // eslint-disable-next-line no-console
    throw new Error('You must provide a controller for the action');
  }

  if (! action) {
    // eslint-disable-next-line no-console
    throw new Error('You must provide a name for the action');
  }

  return { language, version, controller, action };
}

module.exports = {
  renderMarkdownTemplate,
  renderSnippetTemplate,
  renderSnippetConfigTemplate,
  explodeSdkPath,
  extractFromFile,
  injectInFile,
  injectSignatures,
  injectDescription
};
