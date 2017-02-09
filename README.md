[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![codecov.io](http://codecov.io/github/kuzzleio/sdk-javascript/coverage.svg?branch=master)](http://codecov.io/github/kuzzleio/sdk-javascript?branch=master) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)


Official Kuzzle Javascript SDK
======


Please use SDK v1.x for earlier versions of Kuzzle.

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

You can access the Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)

* [SDK Documentation](#sdk-documentation)
* [Protocols used](#protocols-used)
* [Installation](#installation)
  * [NodeJS](#nodejs)
    * [Basic usage](#basic-usage-node)
  * [Javascript](#javascript)
    * [Basic usage](#basic-usage-js)
* [Building manually](#building-manually)
* [Migrating from SDK v1.x](#migrating-from-sdk-v1.x)
* [License](#license)

## SDK Documentation

The complete SDK documentation is available [here](http://kuzzleio.github.io/sdk-documentation)

## Protocols used

The SDK Javascript implements two network protocols: raw WebSocket, and [Socket.IO](http://socket.io/)  
The main reason behind this is that while Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster

What protocol is used when you connect to Kuzzle depends on multiple factors:

#### NodeJS

The protocol used is always raw WebSocket.

#### Web Browsers

The SDK will first try to use raw WebSocket to connect to Kuzzle. If the web browser does not support this protocol, then the SDK falls back to Socket.IO

## Installation

This SDK can be used either in NodeJS or in a browser.

### NodeJS

```
npm install kuzzle-sdk --save
```

#### <a name="basic-usage-node"></a> Basic usage

```javascript
var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle = new Kuzzle('serverName');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocument(myDoc, function(error, response) {
    if (error) {
      // handle error...
    }
    /*
    'response' is a KuzzleDocument object
    */
});

// In NodeJS version, you can also use Promise by suffixing functions with "Promise"
kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocumentPromise(myDoc)
  .then(response => {
    /*
    'response' is a KuzzleDocument object
    */
  })
  .catch(error => {
    // handle error here
  });
});
```

### Javascript

Clone this github repository and run ``npm run build``. A ``dist`` directory will be created, containing a browser version of this SDK.


```html
<script type="text/javascript" src="dist/kuzzle.js"></script>
```

If you want to support older browser versions, you may load `socket.io` before Kuzzle, making the SDK compatible with browsers without websocket support:

```html
<!-- Don't forget to include socketio before kuzzle SDK -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.6.0/socket.io.min.js"></script>
```

#### <a name="basic-usage-js"></a> Basic usage

```javascript
var
  kuzzle = new Kuzzle('serverName');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('music', 'people')
  .createDocument(myDoc, function(error, response) {
    if (error) {
      // handle error...
    }
    /*
    'response' is a KuzzleDocument object
    */
});
```

## Migrating from SDK v1.x

* Kuzzle constructor has been changed. Instead of an URL, you have to provide a resolvable server name, or an IP address. If you need to specify a port different than the provided default value, you can do so using the `port` option.

## License

[Apache 2](LICENSE.md)
