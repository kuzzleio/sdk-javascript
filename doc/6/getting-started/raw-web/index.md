---
code: false
type: page
title: Browser (Vanilla)
description: Getting started with Kuzzle in the browser
order: 100
---

# Getting Started with Kuzzle in the browser

This tutorial explains how to use **Kuzzle** with the **Javascript SDK** in a **browser**.

To follow this tutorial, you must have a Kuzzle Server up and running (you'll need to know the hostname of the machine running it). If this is not already the case, take a look at [how to run Kuzzle](/core/1/guides/getting-started/running-kuzzle/).

Before proceeding, make sure your system has **Node.js** version 8 or higher ([download page](https://nodejs.org/en/download/)) installed.

In this tutorial, you'll learn how to **store** a document and **subscribe** to notifications in Kuzzle using the Javascript SDK.

:::info
Having trouble? Get in touch with us on [Gitter](https://gitter.im/kuzzleio/kuzzle)!
:::

## Prepare your environment

Create your playground directory:

```sh
mkdir "kuzzle-playground"
cd "kuzzle-playground"
```

:::info
If you are performing a clean install you might get some `UNMET PEER DEPENDENCY` warnings, these are safe to ignore as they refer to optional dependencies.
:::

Then, create an `index.html` file with the following structure:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Kuzzle SDK Playground</title>

    <!-- If you are coding for Internet Explorer, please uncomment the following line -->
    <!-- <script src="//cdn.jsdelivr.net/npm/bluebird@3.5.3/js/browser/bluebird.min.js"></script> -->

    <script src="https://cdn.jsdelivr.net/npm/kuzzle-sdk/dist/kuzzle.min.js"></script>
  </head>
  <body></body>
</html>
```

:::info
If you are using Internet Explorer (not Edge), you are responsible of installing a Promise polyfill, which enables IE to support
Javascript [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).  
Our advice is to use [Bluebird](http://bluebirdjs.com/docs/getting-started.html), as shown in the code example above (refer to the commented lines in the `head` tag).
:::

Then, add the code below in the `body` tag.
This loads the SDK and connects it to a Kuzzle instance using the WebSocket protocol. If an error occurs, it is displayed
in the console. Once the connection is established, a success message is displayed in the console.

<<< ./snippets/load-sdk.html

:::info
Replace `kuzzle` with <code>localhost</code> or with the host name where your Kuzzle server is running.
:::

Now you have to add the code that will access Kuzzle to create a new index `nyc-open-data` and a new collection `yellow-taxi`
that you will use to store data later on. Make sure the code inside your `body` tag looks like the following:

<<< ./snippets/prepare-db.html

Now, let's take a look at what your script is doing:

- creates an instance of the SDK,
- connects it to Kuzzle running on `kuzzle` (change the hostname if needed) using WebSocket,
- creates the `nyc-open-data` index,
- creates the `yellow-taxi` collection (within the `nyc-open-data` index),
- disconnects from Kuzzle after the collection is created,
- displays an error whenever something goes wrong.

Run this code by opening the `index.html` file in your favorite browser.
The console should output the following message:

```
Successfully connected to Kuzzle
nyc-open-data/yellow-taxi ready!
```

:::success
Congratulations! You are now ready to say Hello to the World!
:::

:::info
If you reload the page, you should see an error in the console. This is OK, since Kuzzle is just refusing to create
the `nyc-open-data` index as it already exists.
:::

## Create your first "Hello World" document

Create a `create.html` file with the same structure as `index.html` (see above).
And, right like before, add some code to the `body` tag:

<<< ./snippets/create.html

This code does the following:

- creates an instance of the SDK,
- connects it to Kuzzle running on `kuzzle` (change the hostname if needed) using WebSocket,
- creates a new document in the `yellow-taxi` collection, within the `nyc-open-data` index
- logs a success message to the console if everything went fine
- logs an error message if any of the previous actions fails
- disconnects from Kuzzle after the document is created or if an error occurs

Run this code by opening the `create.html` file in your favorite browser.
The console should output the following message:

```
Successfully connected to Kuzzle
New document successfully created!
```

:::success
You have now successfully stored your first document into Kuzzle. Check our [Admin Console Guide](/core/1/guides/essentials/admin-console/) to see how to browse your collection and confirm that your document was saved.
:::


## Subscribe to realtime document notifications (pub/sub)

Kuzzle provides pub/sub features that can be used to trigger real-time notifications based on the state of your data (for a deep-dive on notifications check out the [realtime notifications](/sdk/js/6/essentials/realtime-notifications/) documentation).

Let's get started. Create a `subscribe.html` file (same structure as above) with the following code in the `body` tag:

<<< ./snippets/subscribe.html

Run this code by opening the `subscribe.html` file in a new tab, leaving the previous one (showing `create.html`) open.
The console should output the following message:

```
Successfully connected to Kuzzle
Successfully subscribed to document notifications!
```

The code in the `subscribe.html` page is now running endlessly, waiting for notifications about documents matching its filters, specifically documents that have a `license` field equal to `'B'`.

Now go back to the other tab and reload `create.html`.

This creates a new document in Kuzzle which, in turn, triggers a [document notification](/core/1/api/essentials/notifications/#documents-changes-messages) sent to the `subscribe.html` tab. Check the `subscribe.html` tab: a new message is printed everytime a document is created using the `create.html` code.

```
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
