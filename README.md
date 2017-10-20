[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![codecov.io](http://codecov.io/github/kuzzleio/sdk-javascript/coverage.svg?branch=master)](http://codecov.io/github/kuzzleio/sdk-javascript?branch=master) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)


Official Kuzzle Javascript SDK
======

## About Kuzzle

A backend software, self-hostable and ready to use to power modern apps.

You can access the Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)

* [Basic usage](#basic-usage)
* [SDK Documentation](#sdk-documentation)
* [Report an issue](#report-an-issue)
* [Protocols used](#protocols-used)
* [Installation](#installation)
  * [NodeJS](#nodejs)
  * [Javascript](#javascript)
* [Building manually](#building-manually)
* [License](#license)

## Basic usage

Follow [Kuzzle Guide](http://docs.kuzzle.io/guide/getting-started/#sdk-play-time)

## SDK Documentation

The complete SDK documentation is available [here](http://docs.kuzzle.io/sdk-reference/)

## Report an issue

Use following meta repository to report issues on SDK:

https://github.com/kuzzleio/kuzzle-sdk/issues

## Protocols used

The Javascript SDK implements two network protocols: raw WebSocket, and [Socket.IO](http://socket.io/)  
The main reason behind this is that while Socket.IO offers better compatibility with older web browsers, our raw WebSocket implementation is about 20% faster

Which protocol is used when you connect to Kuzzle depends on multiple factors:

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

## License

[Apache 2](LICENSE.md)
