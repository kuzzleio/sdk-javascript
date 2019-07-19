# Kuzzle Documentation

Our documentation is a statically generated website. The content is stored in a bunch of Markdown files built by [VuePress](https://vuepress.vuejs.org/).

## Start a development server

```sh
npm run dev
```

## Generate a production build

```sh
npm run build
```

## Index documentation content to Algolia

```sh
ALGOLIA_WRITE_KEY=<write_key_here> npm run build
```

Algolia can be configured via the following environment variables

- `ALGOLIA_APP_ID` - The Algolia application ID.
- `ALGOLIA_SEARCH_KEY` - The search key associated to the Algolia index.
- `ALGOLIA_INDEX` - The Algolia index associated to the documentation.
- `ALGOLIA_WRITE_KEY` - The write key associated to the Algolia index.

---

## Content organization

VuePress generates the documentation based on how the files are organized in the filesystem. For example, the URL of each page is direclty infered by its filesystem path relative to `src/`. Also, the left sidebar generation is based on the filesystem location of the files and their [frontmatter](https://v1.vuepress.vuejs.org/guide/frontmatter.html#front-matter) contents.

A page is defined by a directory (e.g. `src/core/1/api/controllers/admin/dump/`) containing an `index.md` file. This file must have a frontmatter with the following form:

```
---
type: [root|branch|page]
code: [true|false]
title: <Name used in the section list>
order: <Integer> (optional)
description: <(optional) Text appearing under the section name in the section list>
nosidebar: <Boolean> (optional)
---
```

:warning: **No other fields are allowed in the frontmatter**

### `type` (required)

Defines how this page behaves in the generation of the sidebar. It is also used by other components (like Algolia indexation). Can be the following values:

- `root` - The page is the root of the generation of an entire sidebar (e.g. `src/code/1/api/`);
- `branch` - The page is a branch of the sidebar and generally has no content but has children (e.g. `src/code/1/api/api-reference`, `src/code/1/api/controllers/admin/`);
- `page` - The page is a "leaf" in the sidebar tree: it has no children and has content. It is indexed to Algolia.

#### `code` (required)

A Boolean field defining whether the name of the page must be displayed in monospace typeface in the menu because it indicates the name of a function, a controller or a piece of code in general (e.g. `src/code/1/api/controllers/admin/`).

#### `title` (required)

A String field holding the text to display in the sidebar.

#### `description` (optional)

A String field holding a detailed description of the page. Currently used nowhere (I guess).

#### `order` (optional)

An Integer field indicating how to sort this page in the sidebar. If absent, the page is sorted alphabetically based on the `title` field.

#### `nosidebar` (optional, default: true)

A Boolean field indicating whether the left sidebar should be displayed for the page or not.

### Frontmatter Linter

The build toolchain runs a linter on the frontmatters. If some frontmatters are invalid, the linter makes the build fail and shows the errors to standard output and dumps them to `frontmatter-errors.js`. Some errors can be automatically fixed: at the end of its report, the linter shows the command to execute to launch the auto-fixer:

```sh
$(npm bin)/frontmatter-fix -e frontmatter-errors.js
```

You can learn more about the linter by looking at its [official repository](https://github.com/xbill82/vuepress-frontmatter-lint).

## Custom containers

You can create alert/info boxes in your markdown with the following syntax:

```markdown
::: info
lorem ipsum
:::
```

Supported containers are : `info`, `success`, `warning`

## Code snippet import

You can [import code snippets from file](https://v1.vuepress.vuejs.org/guide/markdown.html#import-code-snippets), as supported by VuePress, with the following syntax in your Markdown:

```markdown
<<< @/filepath
```

We extended this feature by making it support relative paths. For example, if you have the following files:

```
- /core/1/guides/getting-started/first/steps/
  |
  +- snippets/
  |  |
  |  +- create.js
  |
  +- index.md
```

In your `index.md` file, you can import the `create.js` snippet by writing

```
<<< ./snippets/create.js
```

### Partial code snippet extraction

You can also use special tags to import specific parts of your snippet file. For instance, say your snippet file is like the following:

```javascript
// load the Kuzzle SDK module
import { Kuzzle, WebSocket } from 'kuzzle-sdk';

// instantiate a Kuzzle client
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));

// add a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});

const run = async () => {
  try {
    // Connect to Kuzzle server
    await kuzzle.connect();

    // Create an index
    await kuzzle.index.create('nyc-open-data');

    // Create a collection
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');
    console.log('nyc-open-data/yellow-taxi ready!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};

run();
```

But you only want to import the code of the `run` function. You can use the special `snippet:start` and `snippet:end` comments for this purpose:

```javascript
// load the Kuzzle SDK module
import { Kuzzle, WebSocket } from 'kuzzle-sdk';

// instantiate a Kuzzle client
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));

// add a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});

/* snippet:start */
const run = async () => {
  try {
    // Connect to Kuzzle server
    await kuzzle.connect();

    // Create an index
    await kuzzle.index.create('nyc-open-data');

    // Create a collection
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');
    console.log('nyc-open-data/yellow-taxi ready!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};
/* snippet:end */

run();
```

This way, only the code between the tags will be included in the MD file.

Snippet tags can also bear an ID, so that you can have many of them inside your snippet file, like

```javascript
// load the Kuzzle SDK module
import { Kuzzle, WebSocket } from 'kuzzle-sdk';

// instantiate a Kuzzle client
/* snippet:start:1 */
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));
/* snippet:end */

// add a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});

/* snippet:start:2 */
const run = async () => {
  try {
    // Connect to Kuzzle server
    await kuzzle.connect();

    // Create an index
    await kuzzle.index.create('nyc-open-data');

    // Create a collection
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');
    console.log('nyc-open-data/yellow-taxi ready!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};
/* snippet:end */

run();
```

This way, you can select which snippet you want to include by using the following syntax in you MD file

```
<<< ./snippets/create.js:1
```

The code above will include only

```javascript
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));
```

### Forcing snippet language

In some cases, you might want to force the snippet language, e.g. when importing a partial script from a `.vue` file: in this case, the automatic syntax detection would try to highlight some Javascript code as a VueJS template, which is obviously not what you want.

To force the language highlight, you can use the following syntax

<<< ./snippets/create.vue:1[js]

## Testing code snippets

Because we want our documentation to be bullet-proof, we created a snippet testing tool.

To locally test your snippets, first run a Kuzzle stack:

```sh
bash .ci/start_kuzzle.sh
```

Then you can run snippets for any language:

```bash
# Execute all snippets under the repertory 'src/sdk/js/6'
bash run-snippet-tests.sh -n -s js -v 6 -p src/sdk/js/6
# Execute all snippets for the controller index in SDK CPP 1
bash run-snippet-tests.sh -n -s cpp -v 1 -p src/sdk/cpp/1/controllers/index
```

If you want to avoid downloading the SDK each time you run a snippet, you can use the following variable:

```bash
export DEV_MODE=true
# The following command will download the cpp SDK only if it does not already exist
bash run-snippet-tests.sh -n -p src/sdk/cpp/1/controllers/index
```

### Writing tests

To make a snippet testable, simply create a YML file called `<snippet-name>.test.yml` along with the snippet file, like the following:

```
- /core/1/guides/getting-started/first/steps/
  |
  +- snippets/
  |  |
  |  +- create.js
  |  +- create.test.yml
  |
  +- index.md
```

The `create.test.yml` file of this example would look as follows:

```yaml
name: Create document
description: Create a document in collection
hooks:
  before:
  after:
template: default
expect: document created successfully
```

### Snippet templates

Since code snippets often lack of support and cannot be executed as-is, we use templates to recreate the context of a snippet.

Templates are located in `test/templates`.

A template is a code file containing a special `[snippet-code]` tag that is parsed by the test runner: the runner replaces this tag with the actual code of the snippet. This way, the snipped is injected in its context and can be effectively tested.

Example of a default template for the Javascript SDK:

```js
// load the Kuzzle SDK module
const { Kuzzle } = require('kuzzle-sdk');

// instantiate a Kuzzle client
const kuzzle = new Kuzzle('websocket', {
  host: 'kuzzle',
  autoReconnect: false
});

kuzzle
  .connect()
  .then(() => {
    return [snippet-code];
  })
  .then(() => {
    kuzzle.disconnect();
  });
```

You can add your own template, just respect the naming rule : `template_name.tpl.ext`

## Scaffolding tool

### Create a new controller action documentation

You can use the scaffolding tool to initialize a new SDK controller action documentation, from its Kuzzle API counterpart.

This tool takes the path of your new action as an argument and creates the following files:

- `<language>/<version>/<controller>/<action>/index.md`: controller action documentation
- `<language>/<version>/<controller>/<action>/snippets/<action>.test.yml`: configuration file for the snippet
- `<language>/<version>/<controller>/<action>/snippets/<action>.<language>`: snippet file

Example:

```bash
# Create the files documenting the action 'list' of the controller 'document' for the SDK JS 6
./scaffolding/scaffold generate src/sdk/js/6/controllers/collection/list
```

### Copy an existing action from another SDK

You can also copy an action from another SDK to save time.
This command extracts information from an existing action in another SDK and generates the correct files for another SDK.

Example:

```bash
# Copy information from SDK JS 6 to SDK CPP 1
./scaffolding/scaffold copy src/sdk/js/6/controllers/collection/list src/sdk/cpp/1/controllers/collection/list
```
