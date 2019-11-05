<p align="center">
  <img src="https://user-images.githubusercontent.com/7868838/53197334-3fdcdf00-361a-11e9-8ac4-85f164ee0561.png"/>
</p>
<p align="center">
  <a href="https://travis-ci.org/kuzzleio/sdk-javascript">
    <img src="https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master"/>
  </a>
  <a href="https://codecov.io/gh/kuzzleio/sdk-javascript">
    <img src="https://codecov.io/gh/kuzzleio/sdk-javascript/branch/master/graph/badge.svg" />
  </a>
  <a href="https://david-dm.org/kuzzleio/sdk-javascript">
    <img src="https://david-dm.org/kuzzleio/sdk-javascript.svg" />
  </a>
  <a href="https://github.com/kuzzleio/sdk-javascript/blob/master/LICENSE">
    <img alt="undefined" src="https://img.shields.io/github/license/kuzzleio/sdk-javascript.svg?style=flat">
  </a>
</p>

## About

### Kuzzle Javascript SDK

This is the official Javascript SDK for the free and open-source backend Kuzzle. It provides a way to dial with a Kuzzle server from Javascript applications using protocols.

#### Multiprotocols

Currently, the SDK provides 3 protocols: __Http, WebSocket and SocketIO.__
WebSocket and Socket.IO protocols implement the whole Kuzzle API, while the HTTP protocol does not implement realtime features (rooms and subscriptions).  
While Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster.

#### Promises based

All SDK methods return a promise resolving the result part of Kuzzle API responses. If an error occurs, the promise is rejected with an Error object embedding the error part of the API response.  
For example, for the action create of the controller collection (_collection:create_), the property result contains `{ "acknowledged": true }` . This is therefore what will be returned by the SDK method if successful.  
Any error must be caught either at the end of the `Promise` chain, or by using `async/await` and a `try...catch`.

<p align="center">
  :books: <b><a href="https://docs-v2.kuzzle.io/sdk-reference/js/6/">Documentation</a></b>
</p>

### Kuzzle

Kuzzle is an open-source backend that includes a scalable server, a multiprotocol API,
an administration console and a set of plugins that provide advanced functionalities like real-time pub/sub, blazing fast search and geofencing.

* :octocat: __[Github](https://github.com/kuzzleio/kuzzle)__
* :earth_africa: __[Website](https://kuzzle.io)__
* :books: __[Documentation](https://docs-v2.kuzzle.io)__
* :email: __[Gitter](https://gitter.im/kuzzleio/kuzzle)__


## Get trained by the creators of Kuzzle :zap:

Train yourself and your teams to use Kuzzle to maximize its potential and accelerate the development of your projects.  
Our teams will be able to meet your needs in terms of expertise and multi-technology support for IoT, mobile/web, backend/frontend, devops.  
:point_right: [Get a quote](https://hubs.ly/H0jkfJ_0)

## Usage

## Compatibility matrice

| Kuzzle Version | SDK Version    |
| -------------- | -------------- |
| 1.x.x          | 5.x.x          | 
| 1.x.x          | 6.x.x          | 
| 2.x.x          | 7.x.x          | 

### Installation

This SDK can be used either in NodeJS or in a browser.

#### Node.js 

```
npm install kuzzle-sdk
```

#### Browser

To run the SDK in the browser, you have to build it yourself by cloning this repository and running 
```bash
$ npm install
$ npm run build
````
A `dist` directory will be created, containing a browser version of this SDK.

```html
<script type="text/javascript" src="dist/kuzzle.min.js"></script>
```

or use the CDN:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/kuzzle-sdk@latest/dist/kuzzle.min.js"></script>
```

Then the Kuzzle SDK will be available under the `KuzzleSDK` variable:

```html
  <script>
    const kuzzle = new KuzzleSDK.Kuzzle(
      new KuzzleSDK.WebSocket('localhost')
    );
    // ...
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

### Example

The SDK supports different protocols. When instantiating, 
you must choose the protocol to use and fill in the different options needed to connect to Kuzzle.  

```js
const { Kuzzle,  WebSocket } = require('kuzzle-sdk');
const kuzzle = new Kuzzle(
  new WebSocket('localhost', { port: 7512 })
);

try {
  await kuzzle.connect();
  const serverTime = await kuzzle.server.now();
  console.log(serverTime);
} catch (error) {
  console.error(error);
}
```
