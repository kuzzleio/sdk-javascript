---
type: page
code: false
title: Webpack
description: Getting started with Kuzzle and Webpack
---

# Getting Started with Kuzzle and Webpack

In this tutorial you will learn how to install, run and use **Kuzzle** with the **Javascript SDK** in the browser using **Webpack**.
We will walk you through creating scripts that can **store** documents in Kuzzle and subscribe to **notifications** for each new document created.

## Running Kuzzle

Before going through this tutorial, you should have a Kuzzle server running. Please refer to the [Running Kuzzle Tutorial](https://docs.kuzzle.io/core/1/guide/guides/getting-started/running-kuzzle/) if you don't have one yet.

## Fun with the SDK

It's time to play with the [Kuzzle Javscript SDK](/sdk/js/6). In this section, we will store a document and subscribe to notifications in Kuzzle using the Javascript SDK in your browser.

Before proceeding, please make sure your system has **Node.js** version 8 or higher (<a href="https://nodejs.org/en/download/">instructions here</a>) installed.

## Including the Kuzzle SDK in a Webpack project

<div class="alert alert-info">
    This section explains how to use the Kuzzle SDK within an existing Webpack project.
    If you don't have your project up and running yet and want to learn how to leverage Webpack to build it, please refer to
    the <a href="https://webpack.js.org/guides/getting-started/">official Webpack Getting Started page</a>.
</div>

In your terminal, go to the root of your front-end project using Webpack and type

```bash
npm install kuzzle-sdk
```

<div class="alert alert-info">
If you are performing a clean install you might see some <code>unmet peer dependency</code> warnings, these are safe to ignore as they refer to optional dependencies.
</div>

Then, create a `init-kuzzle.js` file and start by adding the code below. This will load the Kuzzle Javascript SDK:

```javascript
import { Kuzzle, WebSocket } from 'kuzzle-sdk';
```

Next, we instantiate a client that will connect to Kuzzle via WebSocket. If Kuzzle is not running on localhost, replace it with the corresponding server name or IP address.

```javascript
const kuzzle = new Kuzzle(new WebSocket('localhost'));
```

Next we add a listener to be notified in case of a connection error:

```javascript
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});
```

Then we have to connect our web app to the Kuzzle server with the `connect()` method.

```javascript
const run = async () => {
  try {
    // Connect to Kuzzle server
    await kuzzle.connect();

    // Some more things will go here...
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};
```

Finally, we will create a new index `nyc-open-data` and a new collection
`yellow-taxi` that we will use to store data later on.

```javascript
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
```

Your `kuzzle-init.js` file should now look like this:

<<< ./snippets/init-kuzzle.js

This code does the following:

- loads the `kuzzle-sdk` from its NPM package
- creates an instance of the SDK
- connects it to Kuzzle running on `localhost` with the `WebSocket` protocol
- creates the `nyc-open-data` index
- creates the `yellow-taxi` collection (within the `nyc-open-data` index),
- disconnects from Kuzzle after the collection is created or if an error occurs

Now, to have your script up and running, require it somewhere in your application
(e.g. your main entry point) and launch it.

```javascript
require('../path/to/init-kuzzle.js');
```

Your console should output the following message:

```
nyc-open-data/yellow-taxi ready!
```

<div class="alert alert-success">
Congratulations! You are now ready to say Hello to the World!
</div>

<div class="alert alert-info">
Having trouble? Get in touch with us on <a href="https://gitter.im/kuzzleio/kuzzle">Gitter!</a> We're happy to help.
</div>

## Create your first document

Create a `create.js` file with following code:

<<< ./snippets/create.js

This code does the following:

- creates a new document in `nyc-open-data` within the `yellow-taxi` index
- logs a success message to the console if everything went fine
- logs an error message if any of the previous actions failed
- disconnects from Kuzzle after the document is created or if an error occurs

To activate this code, create a button somewhere in your page like the following

```html
<button type="button" id="create-document-btn">
  Crate a new document in Kuzzle
</button>
```

Then, associate it to the `create` function by adding this code to your application

```javascript
const create = require('../path/to/create.js');

// This is the most "vanilla" way to call a function in reaction to a click,
// if you're using a front-end framework like Vuejs, React or jQuery, feel free
// to follow any convenience method it provides for this purpose.
document.querySelector('#create-document-btn').addListener('click', event => {
  create();
});
```

Now, click the button and check your console for a message like the following:

```bash
New document successfully created!
```

<div class="alert alert-success">
    You have now successfully stored your first document into Kuzzle. Click
    <a href="/core/1/guide/guides/essentials/installing-console/">here</a> to see how you can use the
    <strong><a href="http://console.kuzzle.io/">Kuzzle Admin Console</a></strong> to browse your collection and 
    confirm that your document was saved.
</div>

<div class="alert alert-info">
Having trouble? Get in touch with us on <a href="https://gitter.im/kuzzleio/kuzzle">Gitter!</a> We're happy to help.
</div>

## Subscribe to realtime document notifications (pub/sub)

Kuzzle provides pub/sub features that can be used to trigger real-time notifications based on the state of your data (for a deep-dive on notifications check out the <a href="/sdk/js/6/essentials/realtime-notifications/">realtime notifications</a> documentation).

Let's get started. Create a `subscribe.js` file with following code:

<<< ./snippets/subscribe.js

This code does the following:

- loads the `Kuzzle SDK` from its NPM package
- creates an instance of the SDK
- connects it to Kuzzle running on `localhost` with the `websocket` protocol
- defines a filter for the subscription to be done later (drivers with "B" license)
- defines a callback that will be called whenever a notification is received from Kuzzle (print driver name to console)
- subscribes for notifications on the `yellow-taxi` collection

You can execute this code in the same page as before or in another page of your app. Whatever option you choose, to
execute the code, you just need to require it in your page

```javascript
require('../path/to/subscribe.js');
```

From now on, whenever you click the button we created before, Kuzzle will send a notification to the page containing
the subscription to the `yellow-taxi` collection. In the console corresponding to this page, you should see the following message:

```bash
New driver Sirkis with id <driver-id> has B license.
```

In place of `<driver-id>` you'll see the ID that Kuzzle automatically generated for the document.

<div class="alert alert-success">
Congratulations! You have just choreographed your first pub/sub pattern!
</div>

<div class="alert alert-info">
Having trouble? Get in touch with us on <a href="https://gitter.im/kuzzleio/kuzzle">Gitter!</a> We're happy to help.
</div>

## Where do we go from here?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- take a look at the <a href="/sdk/js/6">SDK Reference</a>
- learn how to use <a href="/core/1/koncorde">Koncorde</a> to create incredibly fine-grained and blazing-fast subscriptions
- follow our guide to learn how to implement <a href="/core/1/guide/guides/essentials/user-authentication/#local-strategy">basic authentication</a>
- follow our guide to learn how to implement <a href="/core/1/guide/guides/essentials/security/">manage users and setup fine-grained access control</a>
