[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![codecov.io](http://codecov.io/github/kuzzleio/sdk-javascript/coverage.svg?branch=master)](http://codecov.io/github/kuzzleio/sdk-javascript?branch=master) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)


Official Kuzzle Javascript SDK
======

## About Kuzzle

A backend software, self-hostable and ready to use to power modern apps.

You can access the Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)

* [Basic usage](#basic-usage)
* [SDK Documentation](#sdk-documentation)
* [Protocols used](#protocols-used)
* [Installation](#installation)
  * [NodeJS](#nodejs)
  * [Javascript](#javascript)
* [Building manually](#building-manually)
* [License](#license)

## Basic usage

The SDK supports different protocols. When instantiating, you must choose the protocol to use and fill in the different options needed to connect to Kuzzle.  

Example:
```js
const { Kuzzle } = require('kuzzle-sdk');

const kuzzle = new Kuzzle('websocket', { host: 'localhost', port: 7512 });

kuzzle.connect()
  .then(() => {
    // You are now connected to your Kuzzle instance.
    return kuzzle.server.now();
  })
  .then(serverTime => console.log(serverTime))
  .catch(error => console.error(error));
```

## Installation

This SDK can be used either in NodeJS or in a browser.

### NodeJS

```
npm install kuzzle-sdk --save
# Beta v6
npm install git://github.com/kuzzleio/sdk-javascript.git#6-beta --save
```

### Browser

To run the SDK in the browser, you need to pick the [built beta v6 version available here](https://raw.githubusercontent.com/kuzzleio/sdk-javascript/tree/6-beta/dist/kuzzle.js). You can also build it yourself by cloning this repository and running `npm run build`. A `dist` directory will be created, containing a browser version of this SDK.

```html
<script type="text/javascript" src="dist/kuzzle.js"></script>
```
The browser version is also available from CDN:

```html
<script type="text/javascript" src="https://cdn.rawgit.com/kuzzleio/sdk-javascript/tree/6-beta/dist/kuzzle.js"></script>
```

If you want to support older browser versions, you may load `socket.io` before Kuzzle, making the SDK compatible with browsers without websocket support:

```html
<!-- Don't forget to include socketio before Kuzzle SDK -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.slim.js"></script>
```

#### Browser with Webpack

If you use Webpack, you'll likely use the NPM-packaged version of the SDK (like in Node)

```
npm install kuzzle-sdk --save
```

But you'll still need to pick the built version (which ships with the package).

```javascript
// with the classic require...
const { Kuzzle } = require('kuzzle-sdk/dist/kuzzle.js')
// ... or with the new import directive.
import { Kuzzle } from 'kuzzle-sdk/dist/kuzzle.js'
```

## Protocols used
Actuellement, le SDK supporte nativement 3 protocols: `http`, `websocket` et `socketio`.  

The main reason behind this is that while Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster

Which protocol is used when you connect to Kuzzle depends on multiple factors:

#### NodeJS

The protocol used is always raw WebSocket for `websocket`.

#### Web Browsers

If you choose `websocket`, the SDK will first try to use raw WebSocket to connect to Kuzzle. If the web browser does not support this protocol, then the SDK falls back to Socket.IO.

## SDK Documentation

### Connection to Kuzzle

By default, the SDK is not connected to Kuzzle when it is instantiated. You must manually call the `kuzzle.connect()` method before using the SDK.  

It is then possible to interact with the Kuzzle API through the SDK once the Promise returned by `kuzzle.connect()` has been resolved.  

```js
// Without async/await
kuzzle.connect()
  .then(() => {
    // You are now connected to your Kuzzle instance.
    return kuzzle.server.now();
  })
  .then(serverTime => console.log(serverTime))
  .catch(error => console.error(error));

// With async/await
try {
  await kuzzle.connect();
  const serverTime = await kuzzle.server.now();

  console.log(serverTime);
} catch (error) {
  console.error(error);
}
```

### ISO with the Kuzzle API

The version 6 of this SDK involve a massive refactor of the SDK structure to match the [Kuzzle API](https://docs.kuzzle.io/api-documentation/connecting-to-kuzzle/).  

Each controller is accessible from the Kuzzle object. The controller's actions are named in the same way as in the API.  

For example, for the `create` action of the `document` controller ([document#create](https://docs.kuzzle.io/api-documentation/controller-document/create)):
```js
const options = { refresh: 'wait_for' };
const documentBody = { hello: 'world' };
kuzzle.document.create('my-index', 'my-collection', 'my-uniq-id', documentBody, options)
```

The parameters of each method differ according to the parameters expected in the API.  
To get the details of the parameters of each method, it is necessary for the moment to see the code of each controller on [Github](https://github.com/kuzzleio/sdk-javascript/tree/6-beta/src/controllers).

### Promise based

Each SDK method returns a Promise resolving on the result of the API return (the `result` property described in the API documentation).  

For example, for the action `create` of the controller `collection` ([collection#create](https://docs.kuzzle.io/api-documentation/controller-collection/create)), the property `result` contains `{ "acknowledged": true} `. This is therefore what will be returned by the SDK method if successful.

Any errors must be caught either at the end of the Promise chain, or by using `async/await` and a `try...catch`.

Translated with www.DeepL.com/Translator

```js
const mapping = {
  properties: {
    hello: { type: 'text' }
  }
};
// Without async/await
kuzzle.collection.create('my-index', 'my-collection', mapping)
  .then(result => console.log('Success'))
  .catch(error => console.error(`Hu oh, we've got some error: ${error.message}`));

// With async/await
try {
  const result = await kuzzle.collection.create('my-index', 'my-collection', mapping);
  // result contain { "acknowledged": true }
  console.log('Success');
} catch (error) {
  console.error(`Hu oh, we've got some error: ${error.message}`)
}
```

## License

[Apache 2](LICENSE.md)
