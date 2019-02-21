[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![codecov.io](http://codecov.io/github/kuzzleio/sdk-javascript/coverage.svg?branch=master)](http://codecov.io/github/kuzzleio/sdk-javascript?branch=master) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)

Official Kuzzle Javascript SDK
======

## About Kuzzle

Kuzzle is backend software, self-hostable and ready to use to power modern mobile, IoT and web applications.

You can access Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)

## About Kuzzle JS SDK

This is the SDK to develop JavaScript applications using Kuzzle as backend.

Complete documentation is available on [docs-v2.kuzzle.io](https://docs-v2.kuzzle.io)

* [Basic usage](#basic-usage)
* [Installation](#installation)
  * [NodeJS](#nodejs)
  * [Javascript](#javascript)
* [Protocols used](#protocols-used)
* [SDK Documentation](#sdk-documentation)
* [Building manually](#building-manually)
* [License](#license)

## Basic usage

The SDK supports different protocols. When instantiating, you must choose the protocol to use and fill in the different options needed to connect to Kuzzle.  

Example:

``` js
const {
  Kuzzle,
  WebSocket,
  Http,
  SocketIO
} = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new WebSocket('localhost', { port: 7512 })
);

try {
  const serverTime = kuzzle.server.now();

  console.log(serverTime);
} catch (error) {
  console.error(error);
}
```

## Installation

This SDK can be used either in NodeJS or in a browser.

### Node.js 

```
# Beta v6
npm install kuzzle-sdk
```

### Browser

To run the SDK in the browser, you have to build it yourself by cloning this repository and running `npm run build`. A `dist` directory will be created, containing a browser version of this SDK.

```html
<script type="text/javascript" src="dist/kuzzle.js"></script>
```

Then the Kuzzle SDK will be available under the `KuzzleSDK` variable:

```html
  <script src="dist/kuzzle.js"></script>
  <script>
    const kuzzle = new KuzzleSDK.Kuzzle(
      new KuzzleSDK.WebSocket('localhost')
    );
    kuzzle.connect();
    kuzzle.addListener('connected', () => {
      console.log('Hello Kuzzle');
    });
  </script>
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
const { Kuzzle } = require('kuzzle-sdk')
// ... or with the new import directive.
import { Kuzzle } from 'kuzzle-sdk'
```

## Available protocols

Currently, the SDK provides 3 protocols: `Http`, `WebSocket` and `SocketIO`.  

WebSocket and Socket.IO protocols implement the whole Kuzzle API, while the **HTTP protocol does not implement realtime features** (rooms and subscriptions).  
While Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster.

#### Node.js

We recommend using the `WebSocket` protocol, but you can still use `Http`, `SocketIO` or even a custom protocol if you want.  

#### Web Browsers

We also recommend to use the `WebSocket` or `Http` protocol, but some old browser may not support WebSocket, so you have to implement a fallback to `SocketIO` in that case.

```js
let kuzzle;

if ('WebSocket' in window && window.WebSocket.CLOSING === 2) {
  kuzzle = new Kuzzle(new WebSocket('localhost'));
} else {
  kuzzle = new Kuzzle(new SocketIO('localhost'));
}
```

#### Custom protocol

The SDK also proposes to create custom protocols.  

There are two ways to write these protocols, the first is to inherit the `KuzzleAbstractProtocol` class provided with the SDK and implement only the `connect` and `send` methods.

```js
const { KuzzleAbstractProtocol } = require('kuzzle-sdk');

class MyCustomProtocol extends KuzzleAbstractProtocol {
  connect() {
    // (...) do custom connection steps...

    // change state and resolve:
    this.state = 'ready';
    return Promise.resolve();
  }

  send(request) {
    // (...) here the protocol-specific code to send the request to kuzzle and get the result into `result` variable

    // Send back the result to SDK and resolve:
    this.emit(request.requestId, { result });
    return Promise.resolve();
  }
}
```

The second way is to implement the `isReady` and `query` methods as well as javascript [Event API](https://nodejs.org/api/events.html) by inheriting the `KuzzleEventEmitter` class.

```js
const { KuzzleEventEmitter } = require('kuzzle-sdk');

class MyCustomProtocol extends KuzzleEventEmitter {

  isReady() {
    return true;
  }

  query (request, options) {
    // (...) here the protocol-specific code to send the request to kuzzle and get the result into `result` variable

    // Resolves the response:
    return Promise.resolve({ result });
  }
}
```

These customized protocols can then be used by the SDK by passing them as parameters at instantiation.

```js
const protocol = new MyCustomProtocol();

const kuzzle = new Kuzzle(protocol);
```

## SDK Documentation

### Connection to Kuzzle

By default, the SDK is not connected to Kuzzle when it is instantiated. You must manually call the [kuzzle:connect](https://docs-v2.kuzzle.io/sdk-reference/js/6/kuzzle/connect/) method before using the SDK.  

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

### Match Kuzzle's API

The version 6 of this SDK involve a massive refactor of the SDK structure to match the [Kuzzle API](https://docs-v2.kuzzle.io/api/1/essentials/connecting-to-kuzzle/).  

Each controller is accessible from the Kuzzle object. The controller's actions are named in the same way as in the API.  

For example, for the `create` action of the `document` controller ([document:create](https://docs-v2.kuzzle.io/api/1/controller-document/create)):
```js
const options = { refresh: 'wait_for' };
const document = { hello: 'world' };
kuzzle.document.create('my-index', 'my-collection', document, 'my-uniq-id', options)
```

The parameters of each method differ according to the parameters expected in the API.  
If you want to get the details of the parameters for each method, it is necessary for the moment to see the code of each controller on [Github](https://github.com/kuzzleio/sdk-javascript/tree/6-beta/src/controllers).

#### Query method

This SDK also expose a low level `query` method to access the API even if the controller is not available inside the SDK.  

This method take the controller and action name with all parameters needed by the action (`body`, `_id`, etc.) and return the raw Kuzzle response. This is the method used internally for every controller action in this SDK.

Example with the [Admin](https://docs-v2.kuzzle.io/api/1/controller-admin/reset-cache) controller:
```js
const query = {
  controller: 'admin',
  action: 'resetCache',
  database: 'memoryStorage'
};
const options = {
  refresh: 'wait_for'
};

try {
  const response = await kuzzle.query(query, options);
  /*
  {
    requestId: '6526be09-330d-4183-be2b-8c30183db0f0',
    status: 200,
    error: null,
    controller: 'admin',
    action: 'resetCache',
    collection: null,
    index: null,
    volatile:
     { sdkInstanceId: 'c6fbe345-1d8b-4324-bf1f-2be3cc1a7d27',
       sdkVersion: '6.0.0' },
    result: { acknowledge: true },
    room: '6526be09-330d-4183-be2b-8c30183db0f0'
  }
  */
  console.log('Kuzzle memory storage successfully reset');
} catch (error) {  
  console.error(error);
}
```

### Promise based

All SDK methods return a promise resolving the `result` part of Kuzzle API responses. If an error occurs, the promise is rejected with an `Error` object embedding the `error` part of the API response.

For example, for the action `create` of the controller `collection` ([collection:create](https://docs-v2.kuzzle.io/api/1/controller-collection/create)), the property `result` contains `{ "acknowledged": true} `. This is therefore what will be returned by the SDK method if successful.

Any error must be caught either at the end of the Promise chain, or by using `async/await` and a `try...catch`.

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
  console.log(result);
} catch (error) {
  console.error(`Hu oh, we've got some error: ${error.message}`)
}
```

## License

[Apache 2](LICENSE.md)
