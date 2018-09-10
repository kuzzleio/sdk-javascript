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

Le SDK supporte différents protocols. Lors de l'instanciation, vous devez choisir le protocol à utiliser et renseigner les différentes options nécessaires à la connection à Kuzzle.  

Exemple:
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
```

### Browser

To run the SDK in the browser, you need to pick the [built version available here](https://raw.githubusercontent.com/kuzzleio/sdk-javascript/master/dist/kuzzle.js). You can also build it yourself by cloning this repository and running `npm run build`. A `dist` directory will be created, containing a browser version of this SDK.

```html
<script type="text/javascript" src="dist/kuzzle.js"></script>
```
The browser version is also available from CDN:

```html
<script type="text/javascript" src="https://cdn.rawgit.com/kuzzleio/sdk-javascript/master/dist/kuzzle.js"></script>
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
let Kuzzle = require('kuzzle-sdk/dist/kuzzle.js')
// ... or with the new import directive.
import Kuzzle from 'kuzzle-sdk/dist/kuzzle.js'
```

## Protocols used
Actuellement, le SDK supporte nativement 3 protocols: `http`, `websocket` et `socketio`.  

The main reason behind this is that while Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster

Which protocol is used when you connect to Kuzzle depends on multiple factors:

#### NodeJS

The protocol used is always raw WebSocket.

#### Web Browsers

The SDK will first try to use raw WebSocket to connect to Kuzzle. If the web browser does not support this protocol, then the SDK falls back to Socket.IO


## SDK Documentation

The version 6 of the JS SDK is still in beta release.  
This new version involve a massive refactor of the SDK structure to match the [Kuzzle API](https://docs.kuzzle.io/api-documentation/connecting-to-kuzzle/).  

Chaque contrôleur est accessible à partir de l'objet Kuzzle. Les actions du contrôleur sont nommées de la même manière que dans l'API.  

Par exemple, pour l'action `create` du contrôleur `document`:
```js
const options = { refresh: 'wait_for' };
const documentBody = { hello: 'world' };
kuzzle.document.create('my-index', 'my-collection', 'my-uniq-id', documentBody, options)
```

Pour avoir le détails des paramètres de chaque méthode, il est pour le moment nécessaire d'aller voir le code de chacun des contrôleurs sur [Github](https://github.com/kuzzleio/sdk-javascript/tree/6-dev/src/controllers).


## License

[Apache 2](LICENSE.md)
