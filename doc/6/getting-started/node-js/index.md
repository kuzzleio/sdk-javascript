---
code: false
type: page
title: Node.js
description: Getting started with Kuzzle and Node.js
order: 0
---

# Getting Started with Kuzzle and Node.js

This tutorial explains you how to use **Kuzzle** with **Node.js** and the **Javascript SDK**.
It will walk you through creating scripts that can **store** documents in Kuzzle and subscribe to **notifications** about document creations.

You are going to write an application that **stores** documents in Kuzzle Server and subscribe to **real time notifications** for each created document.

To follow this tutorial, you must have a Kuzzle Server up and running. Follow these instructions if this is not already the case: [Running Kuzzle](/core/1/guides/getting-started/running-kuzzle/).


:::info
Having trouble? Get in touch with us on [Gitter](https://gitter.im/kuzzleio/kuzzle)!
:::

## Explore the SDK

It's time to get started with the [Kuzzle Javascript SDK](/sdk/js/6). This section, explains you how to store a document and subscribe to notifications in Kuzzle using the Javascript SDK.

Before proceeding, please make sure your system has **Node.js** version 8 or higher ([download page](https://nodejs.org/en/download/)) installed.

## Prepare your environment

Create your playground directory and install the Javascript SDK from the command line using npm:

```sh
mkdir "kuzzle-playground"
cd "kuzzle-playground"
npm install kuzzle-sdk
```

:::info
If you are performing a clean install you might get some `UNMET PEER DEPENDENCY` warnings, these are safe to ignore as they refer to optional dependencies.
:::

Then, create an `init.js` file and start by adding the code below.
This loads the SDK and connects it to a Kuzzle instance using the WebSocket protocol.

<<< ./snippets/load-sdk.js

:::info
Replace 'kuzzle' which is the Kuzzle server hostname with 'localhost' or with the host name where your Kuzzle server is running.
:::

Next, add a listener to be notified in case of a connection error:

```js
kuzzle.on('networkError', error => {
  console.error('Network Error: ', error);
});
```

Then, connect the client to your Kuzzle server with the `connect()` method, afterwards you have to add the code that will access Kuzzle to create a new index 'nyc-open-data' and a new collection 'yellow-taxi' that you will use to store data later on.

<<< ./snippets/prepare-db.js

Your `init.js` file should now look like this:

<<< ./snippets/init.js

This code does the following:

- loads the `Kuzzle SDK` from its NPM package
- creates an instance of the SDK
- connects it to Kuzzle running on `kuzzle` (change the hostname if needed) using WebSocket
- creates the `nyc-open-data` index
- creates the `yellow-taxi` collection (within the `nyc-open-data` index),
- disconnects from Kuzzle after the collection is created or if an error occurs

Run the code with Node.js:

```bash
node init.js
```

The console should output the following message:

```bash
nyc-open-data/yellow-taxi ready!
```

:::success
Congratulations! You are now ready to say Hello to the World!
:::

## Create your first "Hello World" document

Create a `create.js` file with the following code:

<<< ./snippets/create.js

This code does the following:

- creates a new document in the `yellow-taxi` collection, within the `nyc-open-data` index
- logs a success message to the console if everything went fine
- logs an error message if any of the previous actions fails
- disconnects from Kuzzle after the document is created or if an error occurs

Run the code with Node.js:

```bash
node create.js
```

:::success
You have now successfully stored your first document into Kuzzle. You can now open an [Admin Console](http://console.kuzzle.io) to browse your collection and confirm that your document was saved.
:::


## Subscribe to realtime document notifications (pub/sub)

Kuzzle provides pub/sub features that can be used to trigger real-time notifications based on the state of your data (for a deep-dive on notifications check out the [realtime notifications](/sdk/js/6/essentials/realtime-notifications/) documentation).

Let's get started. Create a `subscribe.js` file with the following code:

<<< ./snippets/subscribe.js

Run the code with Node.js:

```bash
node subscribe.js
```

The `subscribe.js` program is now running endlessly, waiting for notifications about documents matching its filters, specifically documents that have a `license` field equal to `'B'`.

Now in another terminal, launch the `create.js` file from the previous section.

```bash
node create.js
```

This creates a new document in Kuzzle which, in turn, triggers a [document notification](/core/1/api/essentials/notifications/#documents-changes-messages) sent to the `subscribe.js` program.
Check the `subscribe.js` terminal: a new message is printed everytime a document is created using the `create.js` code.

```bash
New driver Sirkis with id AWccRe3-DfukVhSzMdUo has B license.
```

:::success
Congratulations! You have just set up your first pub/sub communication!
:::

## Where do we go from here?

Now that you're more familiar with Kuzzle, dive even deeper to learn how to leverage its full capabilities:

- discover what this SDK has to offer by browsing other sections of this documentation
- learn how to use [Koncorde](/core/1/koncorde) to create incredibly fine-grained and blazing-fast subscriptions
- learn how to perform a [basic authentication](/sdk/js/6/controllers/auth/login)
- follow our guide to learn how to [manage users, and how to set up fine-grained access control](/core/1/guides/essentials/security/)
