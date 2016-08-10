(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/*global window, require, define */
(function(_window) {
  'use strict';

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

  function setupBrowser() {
    // Allow for MSIE11 msCrypto
    var _crypto = _window.crypto || _window.msCrypto;

    if (!_rng && _crypto && _crypto.getRandomValues) {
      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
      //
      // Moderately fast, high quality
      try {
        var _rnds8 = new Uint8Array(16);
        _whatwgRNG = _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
        _rng();
      } catch(e) {}
    }

    if (!_rng) {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var  _rnds = new Array(16);
      _mathRNG = _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return _rnds;
      };
      if ('undefined' !== typeof console && console.warn) {
        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
      }
    }
  }

  function setupNode() {
    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if ('function' === typeof require) {
      try {
        var _rb = require('crypto').randomBytes;
        _nodeRNG = _rng = _rb && function() {return _rb(16);};
        _rng();
      } catch(e) {}
    }
  }

  if (_window) {
    setupBrowser();
  } else {
    setupNode();
  }

  // Buffer class to use
  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) === 'string') {
      buf = (options === 'binary') ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  uuid._rng = _rng;
  uuid._mathRNG = _mathRNG;
  uuid._nodeRNG = _nodeRNG;
  uuid._whatwgRNG = _whatwgRNG;

  if (('undefined' !== typeof module) && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});


  } else {
    // Publish as global (in browsers)
    _previousRoot = _window.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _window.uuid = _previousRoot;
      return uuid;
    };

    _window.uuid = uuid;
  }
})('undefined' !== typeof window ? window : null);

},{}],3:[function(require,module,exports){
(function (process){
var
  uuid = require('node-uuid'),
  KuzzleDataCollection = require('./kuzzleDataCollection'),
  KuzzleSecurity = require('./security/kuzzleSecurity'),
  KuzzleMemoryStorage = require('./kuzzleMemoryStorage'),
  KuzzleUser = require('./security/kuzzleUser'),
  networkWrapper = require('./networkWrapper');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * Kuzzle object constructor.
 *
 * @constructor
 * @param host - Server name or IP Address to the Kuzzle instance
 * @param [options] - Connection options
 * @param {responseCallback} [cb] - Handles connection response
 * @constructor
 */
module.exports = Kuzzle = function (host, options, cb) {
  var self = this;

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(host, options, cb);
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!host || host === '') {
    throw new Error('host argument missing');
  }

  Object.defineProperties(this, {
    // 'private' properties
    collections: {
      value: {},
      writable: true
    },
    connectCB: {
      value: cb
    },
    eventListeners: {
      value: {
        connected: {lastEmitted: null, listeners: []},
        error: {lastEmitted: null, listeners: []},
        disconnected: {lastEmitted: null, listeners: []},
        reconnected: {lastEmitted: null, listeners: []},
        jwtTokenExpired: {lastEmitted: null, listeners: []},
        loginAttempt: {lastEmitted: null, listeners: []},
        offlineQueuePush: {listeners: []},
        offlineQueuePop: {listeners: []}
      }
    },
    eventTimeout: {
      value: 200
    },
    queuing: {
      value: false,
      writable: true
    },
    requestHistory: {
      value: {},
      writable: true
    },
    state: {
      value: 'initializing',
      writable: true
    },
    subscriptions: {
      /*
       Contains the centralized subscription list in the following format:
          pending: <number of pending subscriptions>
          'roomId': {
            kuzzleRoomID_1: kuzzleRoomInstance_1,
            kuzzleRoomID_2: kuzzleRoomInstance_2,
            kuzzleRoomID_...: kuzzleRoomInstance_...
          }

       This was made to allow multiple subscriptions on the same set of filters, something that Kuzzle does not permit.
       This structure also allows renewing subscriptions after a connection loss
       */
      value: {
        pending: {}
      },
      writable: true
    },
    // read-only properties
    autoReconnect: {
      value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
      enumerable: true
    },
    defaultIndex: {
      value: (options && typeof options.defaultIndex === 'string') ? options.defaultIndex : undefined,
      writable: true,
      enumerable: true
    },
    reconnectionDelay: {
      value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
      enumerable: true
    },
    host: {
      value: host,
      enumerable: true
    },
    wsPort: {
      value: (options && typeof options.wsPort === 'number') ? options.wsPort : 7513,
      enumerable: true
    },
    ioPort: {
      value: (options && typeof options.ioPort === 'number') ? options.ioPort : 7512,
      enumerable: true
    },
    autoQueue: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoReplay: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoResubscribe: {
      value: true,
      enumerable: true,
      writable: true
    },
    headers: {
      value: {},
      enumerable: true,
      writable: true
    },
    metadata: {
      value: {},
      enumerable: true,
      writable: true
    },
    /*
      Offline queue use the following format:
            [
              {
                ts: <query timestamp>,
                query: 'query',
                cb: callbackFunction
              }
            ]
     */
    offlineQueue: {
      value: [],
      enumerable: true,
      writable: true
    },
    queueFilter: {
      value: null,
      enumerable: true,
      writable: true
    },
    queueMaxSize: {
      value: 500,
      enumerable: true,
      writable: true
    },
    queueTTL: {
      value: 120000,
      enumerable: true,
      writable: true
    },
    replayInterval: {
      value: 10,
      enumerable: true,
      writable: true
    },
    jwtToken: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    offlineQueueLoader: {
      value: null,
      enumerable: true,
      writable: true
    }
  });

  if (options) {
    Object.keys(options).forEach(function (opt) {
      if (self.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(self, opt).writable) {
        self[opt] = options[opt];
      }
    });

    if (options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = this.autoResubscribe = true;
    }
  }

  // Helper function ensuring that this Kuzzle object is still valid before performing a query
  Object.defineProperty(this, 'isValid', {
    value: function () {
      if (self.state === 'disconnected') {
        throw new Error('This Kuzzle object has been invalidated. Did you try to access it after a disconnect call?');
      }
    }
  });

  // Helper function copying headers to the query data
  Object.defineProperty(this, 'addHeaders', {
    value: function (query, headers) {
      Object.keys(headers).forEach(function (header) {
        if (!query[header]) {
          query[header] = headers[header];
        }
      });

      return query;
    }
  });

  /**
   * Some methods (mainly read queries) require a callback function. This function exists to avoid repetition of code,
   * and is called by these methods
   */
  Object.defineProperty(this, 'callbackRequired', {
    value: function (errorMessagePrefix, callback) {
      if (!callback || typeof callback !== 'function') {
        throw new Error(errorMessagePrefix + ': a callback argument is required for read queries');
      }
    }
  });

  /**
   * Create an attribute security that embed all methods to manage Role, Profile and User
   */
  Object.defineProperty(this, 'security', {
    value: new KuzzleSecurity(this),
    enumerable: true
  });

  /**
   * Emit an event to all registered listeners
   * An event cannot be emitted multiple times before a timeout has been reached.
   */
  Object.defineProperty(this, 'emitEvent', {
    value: function emitEvent(event) {
      var
        now = Date.now(),
        args = Array.prototype.slice.call(arguments, 1),
        eventProperties = this.eventListeners[event];

      if (eventProperties.lastEmitted && eventProperties.lastEmitted >= now - this.eventTimeout) {
        return false;
      }

      eventProperties.listeners.forEach(function (listener) {
        process.nextTick(function () {
          listener.fn.apply(undefined, args);
        });
      });

      // Events without the 'lastEmitted' property can be emitted without minimum time between emissions
      if (eventProperties.lastEmitted !== undefined) {
        eventProperties.lastEmitted = now;
      }
    }
  });

  Object.defineProperty(this, 'memoryStorage', {
    value: new KuzzleMemoryStorage(this),
    enumerable: true
  });


  if (!options || !options.connect || options.connect === 'auto') {
    this.connect();
  } else {
    this.state = 'ready';
  }

  cleanHistory(this.requestHistory);

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
          'listCollections', 'listIndexes', 'login', 'logout', 'now', 'query',
          'checkToken', 'whoAmI'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
};

/**
 * Connects to a Kuzzle instance using the provided host name.
 * @returns {Object} this
 */
Kuzzle.prototype.connect = function () {
  var self = this;

  if (!self.network) {
    self.network = networkWrapper(self.host, self.wsPort, self.ioPort);
  }

  if (['initializing', 'ready', 'disconnected', 'error', 'offline'].indexOf(this.state) === -1) {
    if (self.connectCB) {
      self.connectCB(null, self);
    }
    return self;
  }

  self.state = 'connecting';
  self.network.connect(self.autoReconnect, self.reconnectionDelay);

  self.network.onConnect(function () {
    self.state = 'connected';
    renewAllSubscriptions.call(self);
    dequeue.call(self);
    self.emitEvent('connected');

    if (self.connectCB) {
      self.connectCB(null, self);
    }
  });

  self.network.onConnectError(function (error) {
    var connectionError = new Error('Unable to connect to kuzzle server at "' + self.host + '"');

    connectionError.internal = error;
    self.state = 'error';
    self.emitEvent('error', connectionError);

    if (self.connectCB) {
      self.connectCB(connectionError);
    }
  });

  self.network.onDisconnect(function () {
    self.state = 'offline';

    if (!self.autoReconnect) {
      self.disconnect();
    }

    if (self.autoQueue) {
      self.queuing = true;
    }

    self.emitEvent('disconnected');
  });

  self.network.onReconnect(function () {
    var reconnect = function () {
      // renew subscriptions
      if (self.autoResubscribe) {
        renewAllSubscriptions.call(self);
      }

      // replay queued requests
      if (self.autoReplay) {
        cleanQueue.call(self);
        dequeue.call(self);
      }

      // alert listeners
      self.emitEvent('reconnected');
    };

    self.state = 'connected';

    if (self.jwtToken) {
      self.checkToken(self.jwtToken, function (err, res) {
        // shouldn't obtain an error but let's invalidate the token anyway
        if (err || !res.valid) {
          self.jwtToken = undefined;
          self.emitEvent('jwtTokenExpired');
        }

        reconnect();
      });
    } else {
      reconnect();
    }
  });

  return this;
};

/**
 * Set the jwtToken used to query kuzzle
 * @param token
 * @returns {Kuzzle}
 */
Kuzzle.prototype.setJwtToken = function(token) {
  if (typeof token === 'string') {
    this.jwtToken = token;
  } else if (typeof token === 'object') {
    if (token.result && token.result.jwt && typeof token.result.jwt === 'string') {
      this.jwtToken = token.result.jwt;
    } else {
      this.emitEvent('loginAttempt', {
        success: false,
        error: 'Cannot find a valid JWT token in the following object: ' + JSON.stringify(token)
      });

      return this;
    }
  } else {
    this.emitEvent('loginAttempt', {success: false, error: 'Invalid token argument: ' + token});
    return this;
  }

  renewAllSubscriptions.call(this);
  this.emitEvent('loginAttempt', {success: true});
  return this;
};

/**
 * Get the jwtToken used by kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.getJwtToken = function() {
  return this.jwtToken;
};

/**
 * Send login request to kuzzle with credentials
 * If login success, store the jwtToken into kuzzle object
 *
 * @param strategy
 * @param credentials
 * @param expiresIn
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.login = function (strategy) {
  var
    self = this,
    request = {
      strategy: strategy
    },
    credentials,
    cb;

  // Handle arguments (credentials, expiresIn, cb)
  if (arguments[1]) {
    if (typeof arguments[1] === 'object') {
      credentials = arguments[1];
    } else if (typeof arguments[1] === 'number' || typeof arguments[1] === 'string') {
      request.expiresIn = arguments[1];
    } else if (typeof arguments[1] === 'function') {
      cb = arguments[1];
    }
  }
  if (arguments[2]) {
    if (typeof arguments[2] === 'number' || typeof arguments[2] === 'string') {
      request.expiresIn = arguments[2];
    } else if (typeof arguments[2] === 'function') {
      cb = arguments[2];
    }
  }
  if (arguments[3] && typeof arguments[3] === 'function') {
    cb = arguments[3];
  }

  if (typeof credentials === 'object') {
    Object.keys(credentials).forEach(function (key) {
      request[key] = credentials[key];
    });
  }

  this.query({controller: 'auth', action: 'login'}, {body: request}, {queuable: false}, function(error, response) {
    if (!error) {
      if (response.result.jwt) {
        self.setJwtToken(response.result.jwt);
      }

      if (cb && typeof cb === 'function') {
        cb(null, response.result);
      }
    }
    else {
      if (cb && typeof cb === 'function') {
        cb(error);
      }

      self.emitEvent('loginAttempt', {success: false, error: error.message});
    }
  });

  return self;
};

/**
 * Send logout request to kuzzle with jwtToken.
 *
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.logout = function (cb) {
  var
    self = this,
    request = {
      action: 'logout',
      controller: 'auth',
      requestId: uuid.v4(),
      body: {}
    };

  this.query({controller: 'auth', action: 'logout'}, request, {queuable: false}, function(error) {
    if (error === null) {
      self.jwtToken = undefined;

      if (typeof cb === 'function') {
        cb(null, self);
      }
    }
    else if (typeof cb === 'function') {
      cb(error);
    }
  });

  return self;
};

/**
 * Checks whether a given jwt token still represents a valid session in Kuzzle.
 *
 * @param  {string}   token     The jwt token to check
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 * @return {Kuzzle}             The Kuzzle instance to enable chaining.
 */
Kuzzle.prototype.checkToken = function (token, callback) {
  var
    self = this,
    request = {
      body: {
        token: token
      }
    };

  this.callbackRequired('Kuzzle.checkToken', callback);

  this.query({controller: 'auth', action: 'checkToken'}, request, {queuable: false}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, response.result);
  });

  return self;
};

/**
 * Fetches the current user.
 *
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 * @return {Kuzzle}             The Kuzzle instance to enable chaining.
 */
Kuzzle.prototype.whoAmI = function (callback) {
  var self = this;

  self.callbackRequired('Kuzzle.whoAmI', callback);

  self.query({controller: 'auth', action: 'getCurrentUser'}, {}, {}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, new KuzzleUser(self.security, response.result._id, response.result._source));
  });

  return self;
};

/**
 * Gets the rights array of the currently logged user.
 *
 * @param  {function} cb The callback containing the normalized array of rights.
 */
Kuzzle.prototype.getMyRights = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.callbackRequired('Kuzzle.getMyRights', cb);

  self.query({controller: 'auth', action:'getMyRights'}, {}, null, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });
};

/**
 * Update current user in Kuzzle.
 *
 * @param {object} content - a plain javascript object representing the user's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Kuzzle.prototype.updateSelf = function (content, options, cb) {
  var
    self = this,
    data = {},
    queryArgs = {controller: 'auth', action: 'updateSelf'};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data.body = content;

  if (cb) {
    self.query(queryArgs, data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result);
    });
  } else {
    self.query(queryArgs, data, options);
  }
};

/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 */
function cleanQueue () {
  var
    self = this,
    now = Date.now(),
    lastDocumentIndex = -1;

  if (self.queueTTL > 0) {
    self.offlineQueue.forEach(function (query, index) {
      if (query.ts < now - self.queueTTL) {
        lastDocumentIndex = index;
      }
    });

    if (lastDocumentIndex !== -1) {
      self.offlineQueue
        .splice(0, lastDocumentIndex + 1)
        .forEach(function (droppedRequest) {
          self.emitEvent('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  if (self.queueMaxSize > 0 && self.offlineQueue.length > self.queueMaxSize) {
    self.offlineQueue
      .splice(0, self.offlineQueue.length - self.queueMaxSize)
      .forEach(function (droppedRequest) {
        self.emitEvent('offlineQueuePop', droppedRequest.query);
      });
  }
}


/**
 * Clean history from requests made more than 10s ago
 */
function cleanHistory (requestHistory) {
  var
    now = Date.now();

  Object.keys(requestHistory).forEach(function (key) {
    if (requestHistory[key] < now - 10000) {
      delete requestHistory[key];
    }
  });

  setTimeout(function () {
    cleanHistory(requestHistory);
  }, 1000);
}

/**
 * Emit a request to Kuzzle
 *
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (request, cb) {
  var
    self = this;

  if (self.jwtToken !== undefined || cb) {
    self.network.once(request.requestId, function (response) {
      if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
        self.jwtToken = undefined;
        self.emitEvent('jwtTokenExpired', request, cb);
      }

      if (cb) {
        cb(response.error, response);
      }
    });
  }

  this.network.send(request);

  // Track requests made to allow KuzzleRoom.subscribeToSelf to work
  self.requestHistory[request.requestId] = Date.now();
}

/**
 * Play all queued requests, in order.
 */
function dequeue () {
  var
    self = this,
    additionalQueue,
    uniqueQueue = {},
    dequeuingProcess = function () {
      if (self.offlineQueue.length > 0) {
        emitRequest.call(self, self.offlineQueue[0].query, self.offlineQueue[0].cb);
        self.emitEvent('offlineQueuePop', self.offlineQueue.shift());

        setTimeout(function () {
          dequeuingProcess();
        }, Math.max(0, self.replayInterval));
      } else {
        self.queuing = false;
      }
    };

  if (self.offlineQueueLoader) {
    if (typeof self.offlineQueueLoader !== 'function') {
      throw new Error('Invalid value for offlineQueueLoader property. Expected: function. Got: ' + typeof self.offlineQueueLoader);
    }

    additionalQueue = self.offlineQueueLoader();
    if (Array.isArray(additionalQueue)) {
      self.offlineQueue = additionalQueue
        .concat(self.offlineQueue)
        .filter(function (request) {
          // throws if the query object does not contain required attributes
          if (!request.query || request.query.requestId === undefined || !request.query.action || !request.query.controller) {
            throw new Error('Invalid offline queue request. One or more missing properties: requestId, action, controller.');
          }

          return uniqueQueue.hasOwnProperty(request.query.requestId) ? false : (uniqueQueue[request.query.requestId] = true);
        });
    } else {
      throw new Error('Invalid value returned by the offlineQueueLoader function. Expected: array. Got: ' + typeof additionalQueue);
    }
  }

  dequeuingProcess();
}

/**
 * Renew all registered subscriptions. Triggered either by a successful connection/reconnection or by a
 * successful login attempt
 */
function renewAllSubscriptions() {
  var self = this;

  Object.keys(self.subscriptions).forEach(function (roomId) {
    Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
      var subscription = self.subscriptions[roomId][subscriptionId];
      subscription.renew(subscription.callback);
    });
  });
}

/**
 * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
 * insertion.
 *
 * The ID returned by this function is required to remove this listener at a later time.
 *
 * @param {string} event - name of the global event to subscribe to (see the 'eventListeners' object property)
 * @param {function} listener - callback to invoke each time an event is fired
 * @returns {string} Unique listener ID
 */
Kuzzle.prototype.addListener = function(event, listener) {
  var
    knownEvents = Object.keys(this.eventListeners),
    listenerType = typeof listener,
    listenerId;

  this.isValid();

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  if (listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  listenerId = uuid.v4();
  this.eventListeners[event].listeners.push({id: listenerId, fn: listener});
  return listenerId;
};


/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method returns all available statistics from Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getAllStatistics = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getAllStatistics', cb);

  this.query({controller:'admin', action: 'getAllStats'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });

  return this;
};

/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
 *
 * @param {number} timestamp -  Epoch time. Starting time from which the frames are to be retrieved
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getStatistics = function (timestamp, options, cb) {
  var queryCB;

  if (!cb) {
    if (arguments.length === 1) {
      cb = arguments[0];
      options = null;
      timestamp = null;
    } else {
      cb = arguments[1];
      if (typeof arguments[0] === 'object') {
        options = arguments[0];
        timestamp = null;
      } else {
        timestamp = arguments[0];
        options = null;
      }
    }
  }

  queryCB = function (err, res) {
    if (err) {
      return cb(err);
    }

    if (timestamp) {
      cb(null, res.result.hits);
    } else {
      cb(null, [res.result]);
    }
  };

  this.callbackRequired('Kuzzle.getStatistics', cb);

  if (!timestamp) {
    this.query({controller: 'admin', action: 'getLastStats'}, {}, options, queryCB);
  } else {
    this.query({controller: 'admin', action: 'getStats'}, { body: { startTime: timestamp } }, options, queryCB);
  }

  return this;
};

/**
 * Create a new instance of a KuzzleDataCollection object.
 * If no index is specified, takes the default index.
 *
 * @param {string} collection - The name of the data collection you want to manipulate
 * @param {string} [index] - The name of the data index containing the data collection
 * @returns {object} A KuzzleDataCollection instance
 */
Kuzzle.prototype.dataCollectionFactory = function(collection, index) {
  this.isValid();

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Unable to create a new data collection object: no index specified');
    }

    index = this.defaultIndex;
  }

  if (typeof index !== 'string') {
    throw new Error('Invalid "index" argument: string expected, got ' + typeof index);
  }

  if (typeof collection !== 'string') {
    throw new Error('Invalid "collection" argument: string expected, got ' + typeof collection);
  }

  if (!this.collections[index]) {
    this.collections[index] = {};
  }

  if (!this.collections[index][collection]) {
    this.collections[index][collection] = new KuzzleDataCollection(this, index, collection);
  }

  return this.collections[index][collection];
};

/**
 * Empties the offline queue without replaying it.
 *
 * @returns {Kuzzle}
 */
Kuzzle.prototype.flushQueue = function () {
  this.offlineQueue = [];
  return this;
};

/**
 * Returns the list of known persisted data collections.
 *
 * @param {string} [index] - Index containing collections to be listed
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.listCollections = function () {
  var
    collectionType = 'all',
    index,
    options,
    cb,
    args = Array.prototype.slice.call(arguments);

  args.forEach(function(arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.listCollections: index required');
    }

    index = this.defaultIndex;
  }

  this.callbackRequired('Kuzzle.listCollections', cb);

  if (options && options.type) {
    collectionType = options.type;
  }

  this.query({index: index, controller: 'read', action: 'listCollections'}, {body: {type: collectionType}}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    return cb(null, res.result.collections);
  });

  return this;
};

/**
 * Returns the list of existing indexes in Kuzzle
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.listIndexes = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.listIndexes', cb);

  this.query({controller: 'read', action: 'listIndexes'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    return cb(null, res.result.indexes);
  });

  return this;
};

/**
 * Disconnects from Kuzzle and invalidate this instance.
 */
Kuzzle.prototype.disconnect = function () {
  var collection;

  this.logout();

  this.state = 'disconnected';
  this.network.close();

  for (collection in this.collections) {
    if (this.collections.hasOwnProperty(collection)) {
      delete this.collections[collection];
    }
  }
};

/**
 * Returns the server informations
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getServerInfo = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getServerInfo', cb);

  this.query({controller: 'read', action: 'serverInfo'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.serverInfo);
  });

  return this;
};

/**
 * Forces an index refresh
 *
 * @param {string} index - The index to refresh. Defaults to Kuzzle.defaultIndex
 * @param {object} options - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {Kuzzle}
 */
Kuzzle.prototype.refreshIndex = function () {
  var
    index,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function(arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.refreshIndex: index required');
    }
    index = this.defaultIndex;
  }

  this.query({ index: index, controller: 'admin', action: 'refreshIndex'}, {}, options, cb);

  return this;
};

/**
 * Returns de current autoRefresh status for the given index
 *
 * @param {string} index - The index to get the status from. Defaults to Kuzzle.defaultIndex
 * @param {object} options - Optinal arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getAutoRefresh = function () {
  var
    index,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.getAutoRefresh: index required');
    }
    index = this.defaultIndex;
  }

  this.callbackRequired('Kuzzle.getAutoRefresh', cb);
  this.query({ index: index, controller: 'admin', action: 'getAutoRefresh'}, {}, options, cb);

  return this;
};

/**
 * (Un)Sets the autoRefresh flag on the given index
 *
 * @param {string} index - the index to modify. Defaults to Kuzzle.defaultIndex
 * @param {boolean} autoRefresh - The autoRefresh value to set
 * @param {object} options - Optional arguments
 * @param {responseCallback} cb - Handles the query result
 * @returns {object} this
 */
Kuzzle.prototype.setAutoRefresh = function () {
  var
    index,
    autoRefresh,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'boolean':
        autoRefresh = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.setAutoRefresh: index required');
    }
    index = this.defaultIndex;
  }

  if (autoRefresh === undefined) {
    throw new Error('Kuzzle.setAutoRefresh: autoRefresh value is required');
  }

  this.query({ index: index, controller: 'admin', action: 'setAutoRefresh'}, { body: { autoRefresh: autoRefresh }}, options, cb);

  return this;
};

/**
 * Return the current Kuzzle's UTC Epoch time, in milliseconds
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.now = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.now', cb);

  this.query({controller: 'read', action: 'now'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.now);
  });

  return this;
};

/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} queryArgs - Query configuration
 * @param {object} query - The query data
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
Kuzzle.prototype.query = function (queryArgs, query, options, cb) {
  var
    attr,
    object = {
      action: queryArgs.action,
      controller: queryArgs.controller,
      metadata: this.metadata
    },
    self = this;

  this.isValid();

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
    if (options.metadata) {
      Object.keys(options.metadata).forEach(function (meta) {
        object.metadata[meta] = options.metadata[meta];
      });
    }

    if (options.queuable === false && self.state === 'offline') {
      return self;
    }
  }

  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new Error('Invalid query parameter: ' + query);
  }

  if (query.metadata) {
    Object.keys(query.metadata).forEach(function (meta) {
      object.metadata[meta] = query.metadata[meta];
    });
  }

  for (attr in query) {
    if (attr !== 'metadata' && query.hasOwnProperty(attr)) {
      object[attr] = query[attr];
    }
  }

  object = self.addHeaders(object, this.headers);

  /*
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wish to verify his token
   */
  if (self.jwtToken !== undefined && !(object.controller === 'auth' && object.action === 'checkToken')) {
    object.headers = object.headers || {};
    object.headers.authorization = 'Bearer ' + self.jwtToken;
  }

  if (queryArgs.collection) {
    object.collection = queryArgs.collection;
  }

  if (queryArgs.index) {
    object.index = queryArgs.index;
  }

  if (!object.requestId) {
    object.requestId = uuid.v4();
  }

  if (self.state === 'connected' || (options && options.queuable === false)) {
    if (self.state === 'connected') {
      emitRequest.call(this, object, cb);
    } else if (cb) {
      cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
    }
  } else if (self.queuing || ['initializing', 'connecting'].indexOf(self.state) !== -1) {
    cleanQueue.call(this, object, cb);

    if (!self.queueFilter || self.queueFilter(object)) {
      self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      self.emitEvent('offlineQueuePush', {query: object, cb: cb});
    }
  }

  return self;
};

/**
 * Removes all listeners, either from a specific event or from all events
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 */
Kuzzle.prototype.removeAllListeners = function (event) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventListeners[event].listeners = [];
  } else {
    knownEvents.forEach(function (eventName) {
      self.eventListeners[eventName].listeners = [];
    });
  }
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {string} listenerId - The ID returned by addListener
 */
Kuzzle.prototype.removeListener = function (event, listenerId) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].listeners.forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].listeners.splice(index, 1);
    }
  });
};

/**
 * Replays the requests queued during offline mode.
 * Works only if the SDK is not in a disconnected state, and if the autoReplay option is set to false.
 */
Kuzzle.prototype.replayQueue = function () {
  if (this.state !== 'offline' && !this.autoReplay) {
    cleanQueue.call(this);
    dequeue.call(this);
  }

  return this;
};

/**
 * Sets the default Kuzzle index
 *
 * @param index
 * @returns this
 */
Kuzzle.prototype.setDefaultIndex = function (index) {
  if (typeof index !== 'string') {
    throw new Error('Invalid default index: [' + index + '] (an index name is expected)');
  }

  if (index.length === 0) {
    throw new Error('Cannot set an empty index as the default index');
  }

  this.defaultIndex = index;

  return this;
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
Kuzzle.prototype.setHeaders = function (content, replace) {
  var self = this;

  if (typeof content !== 'object' || Array.isArray(content)) {
    throw new Error('Expected a content object, received a ' + typeof content);
  }

  if (replace) {
    self.headers = content;
  } else {
    Object.keys(content).forEach(function (key) {
      self.headers[key] = content[key];
    });
  }

  return self;
};

/**
 * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.startQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = true;
  }
  return this;
};

/**
 * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.stopQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = false;
  }

  return this;
};



}).call(this,require('_process'))
},{"./kuzzleDataCollection":4,"./kuzzleMemoryStorage":7,"./networkWrapper":9,"./security/kuzzleSecurity":14,"./security/kuzzleUser":16,"_process":1,"node-uuid":2}],4:[function(require,module,exports){
var
  KuzzleDocument = require('./kuzzleDocument'),
  KuzzleDataMapping = require('./kuzzleDataMapping'),
  KuzzleRoom = require('./kuzzleRoom');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * A data collection is a set of data managed by Kuzzle. It acts like a data table for persistent documents,
 * or like a room for pub/sub messages.
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @param {string} index - Index containing the data collection
 * @param {string} collection - name of the data collection to handle
 * @constructor
 */
function KuzzleDataCollection(kuzzle, index, collection) {
  if (!index || !collection) {
    throw new Error('The KuzzleDataCollection object constructor needs an index and a collection arguments');
  }


  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection,
      enumerable: true
    },
    index: {
      value: index,
      enumerable: true
    },
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(kuzzle.headers)),
      enumerable: true,
      writable: true
    }
  });

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (controller, action) {
      return {
        controller: controller,
        action: action,
        collection: this.collection,
        index: this.index
      };
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['publishMessage', 'setHeaders', 'subscribe'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}

/**
 * Executes an advanced search on the data collection.
 *
 * /!\ There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function.
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.advancedSearch = function (filters, options, cb) {
  var
    query,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleDataCollection.advancedSearch', cb);

  query = self.kuzzle.addHeaders({body: filters}, this.headers);

  self.kuzzle.query(this.buildQueryArgs('read', 'search'), query, options, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new KuzzleDocument(self, doc._id, doc._source);

      newDocument.version = doc._version;

      documents.push(newDocument);
    });

    cb(null, { total: result.result.total, documents: documents });
  });

  return this;
};

/**
 * Returns the number of documents matching the provided set of filters.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.count = function (filters, options, cb) {
  var
    query;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.count', cb);

  query = this.kuzzle.addHeaders({body: filters}, this.headers);

  this.kuzzle.query(this.buildQueryArgs('read', 'count'), query, options, function (error, result) {
    if (error) {
      return cb(error);
    }

    cb(null, result.result.count);
  });

  return this;
};

/**
 * Create a new empty data collection, with no associated mapping.
 * Kuzzle automatically creates data collections when storing documents, but there are cases where we
 * want to create and prepare data collections before storing documents in it.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 * @returns {*} this
 */
KuzzleDataCollection.prototype.create = function (options, cb) {
  var data = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('write', 'createCollection'), data, options, cb);

  return this;
};

/**
 * Create a new document in Kuzzle.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *    - updateIfExist (boolean, default: false):
 *        If the same document already exists: throw an error if sets to false.
 *        Update the existing document otherwise
 *
 * @param {string} [id] - (optional) document identifier
 * @param {object} document - either an instance of a KuzzleDocument object, or a document
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.createDocument = function (id, document, options, cb) {
  var
    self = this,
    data = {},
    action = 'create';

  if (id && typeof id !== 'string') {
    cb = options;
    options = document;
    document = id;
    id = null;
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (document instanceof KuzzleDocument) {
    data = document.serialize();
  } else {
    data.body = document;
  }

  if (options) {
    action = options.updateIfExist ? 'createOrReplace' : 'create';
  }

  if (id) {
    data._id = id;
  }

  data = self.kuzzle.addHeaders(data, self.headers);

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs('write', action), data, options, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleDocument(self, res.result._id, res.result._source);
      doc.version = res.result._version;
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs('write', action), data, options);
  }

  return this;
};

/**
 * Delete persistent documents.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string|object} arg - Either a document ID (will delete only this particular document), or a set of filters
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.deleteDocument = function (arg, options, cb) {
  var
    action,
    data = {};

  if (typeof arg === 'string') {
    data._id = arg;
    action = 'delete';
  } else {
    data.body = arg;
    action = 'deleteByQuery';
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('write', action), data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      if (action === 'delete') {
        cb(null, [res.result._id]);
      } else {
        cb(null, res.result.ids);
      }
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('write', action), data, options);
  }
};

/**
 * Retrieve a single stored document using its unique document ID.
 *
 * @param {string} documentId - Unique document identifier
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.fetchDocument = function (documentId, options, cb) {
  var
    data = {_id: documentId},
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleDataCollection.fetch', cb);
  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('read', 'get'), data, options, function (err, res) {
    var document;

    if (err) {
      return cb(err);
    }

    document = new KuzzleDocument(self, res.result._id, res.result._source);
    document.version = res.result._version;
    cb(null, document);
  });

  return this;
};

/**
 * Retrieves all documents stored in this data collection
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.fetchAllDocuments = function (options, cb) {
  var filters = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  // copying pagination options to the search filter
  if (options) {
    if (options.from) {
      filters.from = options.from;
    }

    if (options.size) {
      filters.size = options.size;
    }
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.fetchAll', cb);

  this.advancedSearch(filters, options, cb);

  return this;
};


/**
 * Instantiates a KuzzleDataMapping object containing the current mapping of this collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Returns an instantiated KuzzleDataMapping object
 * @return {object} this
 */
KuzzleDataCollection.prototype.getMapping = function (options, cb) {
  var kuzzleMapping;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.getMapping', cb);

  kuzzleMapping = new KuzzleDataMapping(this);
  kuzzleMapping.refresh(options, cb);

  return this;
};

/**
 * Publish a realtime message
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} document - either a KuzzleDocument instance or a JSON object
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Returns a raw Kuzzle response
 * @returns {*} this
 */
KuzzleDataCollection.prototype.publishMessage = function (document, options, cb) {
  var data = {};

  if (document instanceof KuzzleDocument) {
    data = document.serialize();
  } else {
    data.body = document;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('write', 'publish'), data, options, cb);

  return this;
};

/**
 * Replace an existing document with a new one.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to replace
 * @param {object} content - JSON object representing the new document version
 * @param {object} [options] - additional arguments
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDocument object
 * @return {object} this
 */
KuzzleDataCollection.prototype.replaceDocument = function (documentId, content, options, cb) {
  var
    self = this,
    data = {
      _id: documentId,
      body: content
    };

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = self.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs('write', 'createOrReplace'), data, options, function (err, res) {
      var document;

      if (err) {
        return cb(err);
      }

      document = new KuzzleDocument(self, res.result._id, res.result._source);
      document.version = res.result._version;
      cb(null, document);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs('write', 'createOrReplace'), data, options);
  }

  return this;
};

/**
 * Subscribes to this data collection with a set of filters.
 * To subscribe to the entire data collection, simply provide an empty filter.
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {object} [options] - subscriptions options
 * @param {responseCallback} cb - called for each new notification
 * @returns {*} KuzzleRoom object
 */
KuzzleDataCollection.prototype.subscribe = function (filters, options, cb) {
  var room;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.subscribe', cb);

  room = new KuzzleRoom(this, options);

  return room.renew(filters, cb);
};

/**
 * Truncate the data collection, removing all stored documents but keeping all associated mappings.
 * This method is a lot faster than removing all documents using a query.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 * @returns {*} this
 */
KuzzleDataCollection.prototype.truncate = function (options, cb) {
  var data = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('admin', 'truncateCollection'), data, options, cb);

  return this;
};


/**
 * Update parts of a document
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to update
 * @param {object} content - JSON object containing changes to perform on the document
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDocument object
 * @return {object} this
 */
KuzzleDataCollection.prototype.updateDocument = function (documentId, content, options, cb) {
  var
    data = {
      _id: documentId,
      body: content
    },
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = self.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs('write', 'update'), data, options, function (err, res) {
      var doc;
      if (err) {
        return cb(err);
      }

      doc = new KuzzleDocument(self, res.result._id);
      doc.refresh(cb);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs('write', 'update'), data, options);
  }

  return self;
};


/**
 * Instantiate a new KuzzleDocument object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - document id
 * @param {object} content - document content
 * @constructor
 */
KuzzleDataCollection.prototype.documentFactory = function (id, content) {
  return new KuzzleDocument(this, id, content);
};

/**
 * Instantiate a new KuzzleRoom object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [options] - subscription configuration
 * @constructor
 */
KuzzleDataCollection.prototype.roomFactory = function (options) {
  return new KuzzleRoom(this, options);
};

/**
 * Instantiate a new KuzzleDataMapping object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [mapping] - mapping to instantiate the KuzzleDataMapping object with
 * @constructor
 */
KuzzleDataCollection.prototype.dataMappingFactory = function (mapping) {
  return new KuzzleDataMapping(this, mapping);
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleDataCollection.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = KuzzleDataCollection;

},{"./kuzzleDataMapping":5,"./kuzzleDocument":6,"./kuzzleRoom":8}],5:[function(require,module,exports){
/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */


/**
 *  When creating a new data collection in the persistent data storage layer, Kuzzle uses a default mapping.
 *  It means that, by default, you won’t be able to exploit the full capabilities of our persistent data storage layer
 *  (currently handled by ElasticSearch), and your searches may suffer from below-average performances, depending on
 *  the amount of data you stored in a collection and the complexity of your database.
 *
 *  The KuzzleDataMapping object allow to get the current mapping of a data collection and to modify it if needed.
 *
 * @param {object} kuzzleDataCollection - Instance of the inherited KuzzleDataCollection object
 * @param {object} mapping - mappings
 * @constructor
 */
function KuzzleDataMapping(kuzzleDataCollection, mapping) {
  Object.defineProperties(this, {
    //read-only properties
    collection: {
      value: kuzzleDataCollection,
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    mapping: {
      value: mapping || {},
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['set', 'setHeaders'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}

/**
 * Applies the new mapping to the data collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleDataMapping.prototype.apply = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({body: {properties: this.mapping}}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.collection.buildQueryArgs('admin', 'updateMapping'), data, options, function (err) {
    if (err) {
      return cb ? cb(err) : false;
    }

    self.refresh(options, cb);
  });

  return this;
};

/**
 * Replaces the current content with the mapping stored in Kuzzle
 *
 * Calling this function will discard any uncommited changes. You can commit changes by calling the “apply” function
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDataMapping.prototype.refresh = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.collection.buildQueryArgs('admin', 'getMapping'), data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    if (res.result[self.collection.index]) {
      if (res.result[self.collection.index].mappings[self.collection.collection]) {
        self.mapping = res.result[self.collection.index].mappings[self.collection.collection].properties;

        // Mappings can be empty. The mapping property should never be "undefined"
        if (self.mapping === undefined) {
          self.mapping = {};
        }
      } else {
        return cb ? cb(new Error('No mapping found for collection ' + self.collection.collection)) : false;
      }
    } else {
      return cb ? cb(new Error('No mapping found for index ' + self.collection.index)) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};


/**
 * Adds or updates a field mapping.
 *
 * Changes made by this function won’t be applied until you call the apply method
 *
 * @param {string} field - Name of the field from which the mapping is to be added or updated
 * @param {object} mapping - corresponding field mapping
 * @returns {KuzzleDataMapping}
 */
KuzzleDataMapping.prototype.set = function (field, mapping) {
  this.mapping[field] = mapping;

  return this;
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleDataMapping.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = KuzzleDataMapping;

},{}],6:[function(require,module,exports){
/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * Kuzzle handles documents either as realtime messages or as stored documents.
 * KuzzleDocument is the object representation of one of these documents.
 *
 * Notes:
 *   - this constructor may be called either with a documentId, a content, neither or both.
 *   - providing a documentID to the constructor will automatically call refresh, unless a content is also provided
 *
 *
 * @param {object} kuzzleDataCollection - an instanciated KuzzleDataCollection object
 * @param {string} [documentId] - ID of an existing document
 * @param {object} [content] - Initializes this document with the provided content
 * @constructor
 */
function KuzzleDocument(kuzzleDataCollection, documentId, content) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
    },
    dataCollection: {
      value: kuzzleDataCollection,
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    id: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    version: {
      value: undefined,
      enumerable: true,
      writable: true
    }
  });

  // handling provided arguments
  if (!content && documentId && typeof documentId === 'object') {
    content = documentId;
    documentId = null;
  }

  if (content) {
    if (content._version) {
      this.version = content._version;
      delete content._version;
    }
    this.setContent(content, true);
  }

  if (documentId) {
    Object.defineProperty(this, 'id', {
      value: documentId,
      enumerable: true
    });
  }

  // promisifying
  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'refresh', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this document
 */
KuzzleDocument.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;
  data._version = this.version;
  data = this.kuzzle.addHeaders(data, this.headers);

  return data;
};

/**
 * Overrides the toString() method in order to return a serialized version of the document
 *
 * @return {string} serialized version of this object
 */
KuzzleDocument.prototype.toString = function () {
  return JSON.stringify(this.serialize());
};

/**
 * Deletes this document in Kuzzle.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.delete = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('KuzzleDocument.delete: cannot delete a document without a document ID');
  }

  if (cb) {
    this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'delete'), this.serialize(), options, function (err) {
      if (err) {
        return cb(err);
      }

      cb(null, self.id);
    });
  } else {
    this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'delete'), this.serialize(), options);
  }
};

/**
 * Replaces the current content with the last version of this document stored in Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.refresh = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('KuzzleDocument.refresh: cannot retrieve a document if no ID has been provided');
  }

  this.kuzzle.callbackRequired('KuzzleDocument.refresh', cb);

  self.kuzzle.query(self.dataCollection.buildQueryArgs('read', 'get'), {_id: self.id}, options, function (error, res) {
    var newDocument;

    if (error) {
      return cb(error);
    }

    newDocument = new KuzzleDocument(self.dataCollection, self.id, res.result._source);
    newDocument.version = res.result._version;

    cb(null, newDocument);
  });
};

/**
 * Saves this document into Kuzzle.
 *
 * If this is a new document, this function will create it in Kuzzle and the id property will be made available.
 * Otherwise, this method will replace the latest version of this document in Kuzzle by the current content
 * of this object.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'createOrReplace'), data, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.id = res.result._id;
    self.version = res.result._version;

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Sends the content of this document as a realtime message.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @returns {*} this
 */
KuzzleDocument.prototype.publish = function (options) {
  var data = this.serialize();

  this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'publish'), data, options);

  return this;
};

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {object} data - New content
 * @param {boolean} replace - if true: replace this document content with the provided data
 */
KuzzleDocument.prototype.setContent = function (data, replace) {
  var self = this;

  if (replace) {
    this.content = data;
  }
  else {
    Object.keys(data).forEach(function (key) {
      self.content[key] = data[key];
    });
  }

  return this;
};

/**
 * Listens to events concerning this document. Has no effect if the document does not have an ID
 * (i.e. if the document has not yet been created as a persisted document).
 *
 * @param {object} [options] - subscription options
 * @param {responseCallback} cb - callback that will be called each time a change has been detected on this document
 */
KuzzleDocument.prototype.subscribe = function (options, cb) {
  var filters;

  if (options && !cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDocument.subscribe', cb);

  if (!this.id) {
    throw new Error('KuzzleDocument.subscribe: cannot subscribe to a document if no ID has been provided');
  }

  filters = { ids: { values: [this.id] } };

  return this.dataCollection.subscribe(filters, options, cb);
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleDocument.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};


module.exports = KuzzleDocument;

},{}],7:[function(require,module,exports){
/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */


/**
 * Kuzzle's memory storage is a separate data store from the database layer.
 * It is internaly based on Redis. You can access most of Redis functions (all
 * lowercased), excepting:
 *   * all cluster based functions
 *   * all script based functions
 *   * all cursors functions
 *
 * For instance:
 *     kuzzle.memoryStorage
 *      .set('myKey', 'myValue')
 *      .get('myKey', function (err, response) {
 *        console.log(response.result);
 *
 *        // { _id: 'foo', body: { value: 'myValue' }}
 *      });
 *
 *
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @constructor
 */
function KuzzleMemoryStorage(kuzzle) {
  Object.defineProperties(this, {
    // read-only properties
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(kuzzle.headers)),
      enumerable: true,
      writable: true
    }
  });

  this.setHeaders = kuzzle.setHeaders.bind(this);

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['setHeaders'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}


/**
 * constructs the memoryStorage functions.
 */
(function() {

  var
    keyVal = ['id', 'value'],
    idOrKeys = ['id', 'keys'],
    commands = {
      append: keyVal,
      bgrewriteaof: [],
      bgsave: [],
      bitcount: ['id', 'start', 'end'],
      bitop: ['operation', 'destkey', idOrKeys],
      bitpos: ['id', 'bit', { __opts__: ['start', 'end']}],
      blpop: [idOrKeys, 'timeout'],
      brpoplpush: ['source', 'destination'],
      dbsize: [],
      decrby: keyVal,
      del: [idOrKeys],
      discard: [],
      exec: [],
      exists: [idOrKeys],
      expire: ['id', 'seconds'],
      expireat: ['id', 'timestamp'],
      flushdb: [],
      // @todo: implement geolocation methods once available in Redis stable release
      getbit: ['id', 'offset'],
      getrange: ['id', 'start', 'end'],
      hdel: ['id', ['field', 'fields']],
      hexists: ['id', 'field'],
      hincrby: ['id', 'field', 'value'],
      hmset: ['id', 'values'],
      hset: ['id', 'field', 'value'],
      info: ['section'],
      keys: [ 'pattern' ],
      lastsave: [],
      lindex: ['id', 'idx'],
      linsert: ['id', 'position', 'pivot', 'value'],
      lpush: ['id', ['value', 'values']],
      lrange: ['id', 'start', 'stop'],
      lrem: ['id', 'count', 'value'],
      lset: ['id', 'idx', 'value'],
      ltrim: ['id', 'start', 'stop'],
      mset: ['values'],
      multi: [],
      object: ['subcommand', 'args'],
      pexpire: ['id', 'milliseconds'],
      pexpireat: ['id', 'timestamp'],
      pfadd: ['id', ['element', 'elements']],
      pfmerge: ['destkey', ['sourcekey', 'sourcekeys']],
      ping: [],
      psetex: ['id', 'milliseconds', 'value'],
      publish: ['channel', 'message'],
      randomkey: [],
      rename: ['id', 'newkey'],
      renamenx: ['id', 'newkey'],
      restore: ['id', 'ttl', 'content'],
      rpoplpush: ['source', 'destination'],
      sadd: ['id', ['member', 'members']],
      save: [],
      set: ['id', 'value', {__opts__:['ex', 'px', 'nx', 'xx']}],
      sdiffstore: ['destination', idOrKeys],
      setbit: ['id', 'offset', 'value'],
      setex: ['id', 'seconds', 'value'],
      setrange: ['id', 'offset', 'value'],
      sinterstore: ['destination', idOrKeys],
      sismember: ['id', 'member'],
      smove: ['id', 'destination', 'member'],
      sort: ['id', {__opts__:['by', 'offset', 'count', 'get', 'direction', 'alpha', 'store']}],
      spop: ['id', 'count'],
      srem: ['id', ['member', 'members']],
      sunionstore: ['destination', idOrKeys],
      unwatch: [],
      wait: ['numslaves', 'timeout'],
      zadd: ['id', {__opts__: ['nx', 'xx', 'ch', 'incr', 'score', 'member', 'members']}],
      zcount: ['id', 'min', 'max'],
      zincrby: ['id', 'value', 'member'],
      zinterstore: ['destination', idOrKeys, {__opts__: ['weight', 'weights', 'aggregate']}],
      zlexcount: ['id', 'min', 'max'],
      zrange: ['id', 'start', 'stop', {__opts__: ['withscores']}],
      zrangebylex: ['id', 'min', 'max', {__opts__: ['offset', 'count']}],
      zrangebyscore: ['id', 'min', 'max', {__opts__: ['withscores', 'offset', 'count']}],
      zrem: ['id', 'member'],
      zremrangebylex: ['id', 'min', 'max'],
      zremrangebyscore: ['id', 'min', 'max'],
      zrevrangebylex: ['id', 'max', 'min', {__opts__: ['offset', 'count']}],
      zrevrangebyscore: ['id', 'max', 'min', {__opts__: ['withscores', 'offset', 'count']}],
      zrevrank: ['id', 'member']
    };

  // unique argument key
  commands.decr = commands.get = commands.dump = commands.hgetall = commands.hkeys = commands.hlen = commands.hstrlen = commands.hvals = commands.incr = commands.llen = commands.lpop = commands.persist = commands.pttl = commands.rpop = commands.scard = commands.smembers = commands.strlen = commands.ttl = commands.type = commands.zcard = ['id'];

  // key value
  commands.getset = commands.lpushx = keyVal;

  // key key...
  commands.del = commands.exists = commands.mget = commands.pfcount = commands.sdiff = commands.sinter = commands.sunion = commands.watch = [idOrKeys];

  commands.incrby = commands.incrbyfloat = commands.decrby;
  commands.brpop = commands.blpop;
  commands.hget = commands.hexists;
  commands.hmget = commands.hdel;
  commands.hsetnx = commands.hset;
  commands.msetnx = commands.mset;
  commands.rpush = commands.lpush;
  commands.hincrbyfloat = commands.hincrby;
  commands.srandmember = commands.spop;
  commands.zrevrange = commands.zrange;
  commands.zscore = commands.zrevrank;

  Object.keys(commands).forEach(function (command) {
    KuzzleMemoryStorage.prototype[command] = function () {
      var
        args = Array.prototype.slice.call(arguments),
        options = null,
        cb,
        query = {
          controller: 'ms',
          action: command
        },
        data = {};

      if (typeof args[args.length - 1] === 'function') {
        cb = args.pop();
      }

      if (args.length && typeof args[args.length - 1] === 'object' && Object.keys(args[args.length - 1]).length === 1 && args[args.length - 1].queuable !== undefined) {
        options = args.pop();
      }

      commands[command].forEach(function (v, i) {
        if (args[i] === undefined) {
          return;
        }

        if (Array.isArray(v)) {
          v = Array.isArray(args[i]) ? v[1] : v[0];
        }

        if (v === 'id') {
          data._id = args[i];
        }
        else {
          if (!data.body) {
            data.body = {};
          }

          if (typeof v === 'object' && v.__opts__ !== undefined) {
            v.__opts__.forEach(function (arg) {
              if (args[i][arg] !== undefined) {
                data.body[arg] = args[i][arg];
              }
            });
          }
          else {
            data.body[v] = args[i];
          }
        }
      });

      this.kuzzle.query(query, data, options, cb);

      return this;

    };
  });

})();

module.exports = KuzzleMemoryStorage;

},{}],8:[function(require,module,exports){
var
  uuid = require('node-uuid');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * This object is the result of a subscription request, allowing to manipulate the subscription itself.
 *
 * In Kuzzle, you don’t exactly subscribe to a room or a topic but, instead, you subscribe to documents.
 *
 * What it means is that, to subscribe, you provide to Kuzzle a set of matching filters.
 * Once you have subscribed, if a pub/sub message is published matching your filters, or if a matching stored
 * document change (because it is created, updated or deleted), then you’ll receive a notification about it.
 *
 * @param {object} kuzzleDataCollection - an instantiated and valid kuzzle object
 * @param {object} [options] - subscription optional configuration
 * @constructor
 */
function KuzzleRoom(kuzzleDataCollection, options) {
  // Define properties
  Object.defineProperties(this, {
    // private properties
    callback: {
      value: null,
      writable: true
    },
    channel: {
      value: null,
      writable: true
    },
    id: {
      value: uuid.v4()
    },
    lastRenewal: {
      value: null,
      writable: true
    },
    notifier: {
      value: null,
      writable: true
    },
    queue: {
      value: [],
      writable: true
    },
    // Delay before allowing a subscription renewal
    renewalDelay: {
      value: 500
    },
    scope: {
      value: options && options.scope ? options.scope : 'all'
    },
    state: {
      value: options && options.state ? options.state : 'done'
    },
    subscribing: {
      value: false,
      writable: true
    },
    users: {
      value: options && options.users ? options.users : 'none'
    },
    // read-only properties
    collection: {
      value: kuzzleDataCollection,
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    filters: {
      value: null,
      enumerable: true,
      writable: true
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    metadata: {
      value: (options && options.metadata) ? options.metadata : {},
      enumerable: true,
      writable: true
    },
    roomId: {
      value: null,
      enumerable: true,
      writable: true
    },
    subscribeToSelf: {
      value: options && typeof options.subscribeToSelf === 'boolean' ? options.subscribeToSelf : true,
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['count'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * Returns the number of other subscriptions on that room.
 *
 * @param {responseCallback} cb - Handles the query response
 */
KuzzleRoom.prototype.count = function (cb) {
  var data;

  this.kuzzle.callbackRequired('KuzzleRoom.count', cb);

  data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);

  if (!isReady.call(this)) {
    this.queue.push({action: 'count', args: [cb]});
    return this;
  }

  if (!this.roomId) {
    throw new Error('KuzzleRoom.count: cannot count subscriptions on an inactive room');
  }

  this.kuzzle.query(this.collection.buildQueryArgs('subscribe', 'count'), data, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.count);
  });

  return this;
};

/**
 * Renew the subscription using new filters
 *
 * @param {object} [filters] - Filters in Kuzzle DSL format
 * @param {responseCallback} cb - called for each new notification
 */
KuzzleRoom.prototype.renew = function (filters, cb) {
  var
    now = Date.now(),
    subscribeQuery = {
      scope: this.scope,
      state: this.state,
      users: this.users
    },
    self = this;

  if (!cb && filters && typeof filters === 'function') {
    cb = filters;
    filters = null;
  }

  self.kuzzle.callbackRequired('KuzzleRoom.renew', cb);

  /*
    Skip subscription renewal if another one was performed a moment before
   */
  if (self.lastRenewal && (now - self.lastRenewal) <= self.renewalDelay) {
    return self;
  }

  if (filters) {
    self.filters = filters;
  }

  /*
   if not yet connected, register itself to the subscriptions list and wait for the
   main Kuzzle object to renew once online
    */
  if (self.kuzzle.state !== 'connected') {
    self.callback = cb;
    self.kuzzle.subscriptions.pending[self.id] = self;
    return self;
  }

  if (self.subscribing) {
    self.queue.push({action: 'renew', args: [filters, cb]});
    return self;
  }

  self.unsubscribe();
  self.roomId = null;
  self.subscribing = true;
  self.callback = cb;
  self.kuzzle.subscriptions.pending[self.id] = self;

  subscribeQuery.body = self.filters;
  subscribeQuery = self.kuzzle.addHeaders(subscribeQuery, this.headers);

  self.kuzzle.query(self.collection.buildQueryArgs('subscribe', 'on'), subscribeQuery, {metadata: self.metadata}, function (error, response) {
    delete self.kuzzle.subscriptions.pending[self.id];
    self.subscribing = false;

    if (error) {
      self.queue = [];
      throw new Error('Error during Kuzzle subscription: ' + error.message);
    }

    self.lastRenewal = now;
    self.roomId = response.result.roomId;
    self.channel = response.result.channel;

    if (!self.kuzzle.subscriptions[self.roomId]) {
      self.kuzzle.subscriptions[self.roomId] = {};
    }

    self.kuzzle.subscriptions[self.roomId][self.id] = self;

    self.notifier = notificationCallback.bind(self);
    self.kuzzle.network.on(self.channel, self.notifier);

    dequeue.call(self);
  });

  return self;
};

/**
 * Unsubscribes from Kuzzle.
 *
 * Stop listening immediately. If there is no listener left on that room, sends an unsubscribe request to Kuzzle, once
 * pending subscriptions reaches 0, and only if there is still no listener on that room.
 * We wait for pending subscriptions to finish to avoid unsubscribing while another subscription on that room is
 *
 * @return {*} this
 */
KuzzleRoom.prototype.unsubscribe = function () {
  var
    self = this,
    room = self.roomId,
    interval;

  if (!isReady.call(this)) {
    self.queue.push({action: 'unsubscribe', args: []});
    return self;
  }

  if (room) {
    self.kuzzle.network.off(self.channel, this.notifier);

    if (Object.keys(self.kuzzle.subscriptions[room]).length === 1) {
      delete self.kuzzle.subscriptions[room];

      if (Object.keys(self.kuzzle.subscriptions.pending).length === 0) {
        self.kuzzle.query(self.collection.buildQueryArgs('subscribe', 'off'), {body: {roomId: room}});
      } else {
        interval = setInterval(function () {
          if (Object.keys(self.kuzzle.subscriptions.pending).length === 0) {
            if (!self.kuzzle.subscriptions[room]) {
              self.kuzzle.query(self.collection.buildQueryArgs('subscribe', 'off'), {body: {roomId: room}});
            }
            clearInterval(interval);
          }
        }, 100);
      }
    } else {
      delete self.kuzzle.subscriptions[room][self.id];
    }

    self.roomId = null;
  }

  return self;
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleRoom.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

/**
 * Callback called by the network handler when a message is sent to the subscribed room ID
 * Calls the registered callback if the notification passes the subscription filters
 *
 * @param {object} data - data
 * @returns {*}
 */
function notificationCallback (data) {
  if (data.error) {
    return this.callback(data.error);
  }

  if (data.action === 'jwtTokenExpired') {
    this.kuzzle.jwtToken = undefined;
    return this.kuzzle.emitEvent('jwtTokenExpired');
  }

  if (this.kuzzle.requestHistory[data.requestId]) {
    if (this.subscribeToSelf) {
      this.callback(null, data);
    }
    delete this.kuzzle.requestHistory[data.requestId];
  } else {
    this.callback(null, data);
  }
}


/**
 * Dequeue actions performed while subscription was being renewed
 */
function dequeue () {
  var element;

  while (this.queue.length > 0) {
    element = this.queue.shift();

    this[element.action].apply(this, element.args);
  }
}

function isReady() {
  if (this.kuzzle.state !== 'connected' || this.subscribing) {
    return false;
  }
  return true;
}

module.exports = KuzzleRoom;

},{"node-uuid":2}],9:[function(require,module,exports){
/**
 *
 * @param host
 * @param wsPort
 * @param ioPort
 * @returns {Object} tnstantiated WebSocket/Socket.IO object
 */

function network(host, wsPort, ioPort) {
  // Web browser / NodeJS websocket handling
  if (typeof window !== 'undefined') {
    // use native websockets if the browser supports it
    if (typeof WebSocket !== 'undefined') {
      return new (require('./wrappers/wsbrowsers'))(host, wsPort);
    }
    // otherwise fallback to socket.io, if available
    else if (window.io) {
      return new (require('./wrappers/socketio'))(host, ioPort);
    }

    throw new Error('Aborting: no websocket support detected and no socket.io library loaded either.');
  }

  return new (require('./wrappers/wsnode'))(host, wsPort);
}

module.exports = network;

},{"./wrappers/socketio":10,"./wrappers/wsbrowsers":11,"./wrappers/wsnode":undefined}],10:[function(require,module,exports){
function SocketIO(host, port) {
  this.host = host;
  this.port = port;
  this.socket = null;

  /**
   * Creates a new socket from the provided arguments
   *
   * @constructor
   * @param {boolean} autoReconnect
   * @param {int} reconnectionDelay
   */
  this.connect = function (autoReconnect, reconnectionDelay) {
    this.socket = window.io('http://' + this.host + ':' + this.port, {
      reconnection: autoReconnect,
      reconnectionDelay: reconnectionDelay,
      forceNew: true
    });
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
    this.socket.on('connect', callback);
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
    this.socket.on('connect_error', callback);
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
    this.socket.on('disconnect', callback);
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
    this.socket.on('reconnect', callback);
  };

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.once = function (roomId, callback) {
    this.socket.once(roomId, callback);
  };

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.on = function (roomId, callback) {
    this.socket.on(roomId, callback);
  };

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.off = function (roomId, callback) {
    this.socket.off(roomId, callback);
  };


  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  this.send = function (payload) {
    this.socket.emit('kuzzle', payload);
  };

  /**
   * Closes the connection
   */
  this.close = function () {
    this.socket.close();
    this.socket = null;
  };
}

module.exports = SocketIO;

},{}],11:[function(require,module,exports){
function WSBrowsers(host, port) {
  var self = this;
  this.host = host;
  this.port = port;
  this.client = null;
  this.retrying = false;

  /*
     Listeners are stored using the following format:
     roomId: {
     fn: callback_function,
     once: boolean
     }
   */
  this.listeners = {
    error: [],
    connect: [],
    disconnect: [],
    reconnect: []
  };

  /**
   * Creates a new socket from the provided arguments
   *
   * @constructor
   * @param {boolean} autoReconnect
   * @param {int} reconnectionDelay
   * @returns {Object} Socket
   */
  this.connect = function (autoReconnect, reconnectionDelay) {
    this.client = new WebSocket('ws://' + this.host + ':' + this.port);

    this.client.onopen = function () {
      if (self.retrying) {
        poke(self.listeners, 'reconnect');
      }
      else {
        poke(self.listeners, 'connect');
      }
    };

    this.client.onclose = function () {
      poke(self.listeners, 'disconnect');
    };

    this.client.onerror = function () {
      if (autoReconnect) {
        self.retrying = true;
        setTimeout(function () {
          self.connect(autoReconnect, reconnectionDelay);
        }, reconnectionDelay);
      }

      poke(self.listeners, 'error');
    };

    this.client.onmessage = function (payload) {
      var data = JSON.parse(payload.data);

      if (data.room && self.listeners[data.room]) {
        poke(self.listeners, data.room, data);
      }
    };
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
    this.listeners.connect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
    this.listeners.error.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
    this.listeners.disconnect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
    this.listeners.reconnect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.once = function (roomId, callback) {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = [];
    }

    this.listeners[roomId].push({
      fn: callback,
      keep: false
    });
  };

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.on = function (roomId, callback) {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = [];
    }

    this.listeners[roomId].push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.off = function (roomId, callback) {
    var index;

    if (this.listeners[roomId]) {
      index = this.listeners[roomId].findIndex(function (listener) {
        return listener.fn === callback;
      });

      if (index !== -1) {
        if (this.listeners[roomId].length === 1 && ['error', 'connect', 'disconnect', 'reconnect'].indexOf(roomId) === -1) {
          delete this.listeners[roomId];
        }
        else {
          this.listeners[roomId].splice(index, 1);
        }
      }
    }
  };


  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  this.send = function (payload) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(payload));
    }
  };

  /**
   * Closes the connection
   */
  this.close = function () {
    this.listeners = {
      error: [],
      connect: [],
      disconnect: [],
      reconnect: []
    };

    this.retrying = false;
    this.client.close();
    this.client = null;
  };
}

/**
 * Executes all registered listeners in the provided
 * "listeners" structure.
 *
 * Listeners are of the following format:
 * [
 *    { fn: callback, once: boolean },
 *    ...
 * ]
 *
 * @private
 * @param {Object} listeners
 * @param {string} roomId
 * @param {Object} [payload]
 */
function poke (listeners, roomId, payload) {
  var
    i,
    length = listeners[roomId].length;

  for (i = 0; i < length; ++i) {
    listeners[roomId][i].fn(payload);

    if (!listeners[roomId][i].keep) {
      if (listeners[roomId].length > 1) {
        listeners[roomId].splice(i, 1);
        --i;
        --length;
      }
      else {
        delete listeners[roomId];
      }
    }
  }
}

module.exports = WSBrowsers;

},{}],12:[function(require,module,exports){
var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleProfile(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteProfile'
    },
    updateActionName: {
      value: 'updateProfile'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleProfile.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleProfile
  }
});

/**
 * Persist to the persistent layer the current profile
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {
  var
    data,
    self = this;

  if (!this.content.policies) {
    throw new Error('Argument "policies" is mandatory in a profile. This argument contains an array of objects.');
  }

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.serialize();

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('createOrReplaceProfile'), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};


/**
 * Add a policy in the policies list
 * @param {Object} policy - must be an object containing at least a "roleId" member which must be a string.
 *
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.addPolicy = function (policy) {

  if (typeof policy !== 'object' || typeof policy.roleId !== 'string') {
    throw new Error('Parameter "policies" must be an object containing at least a "roleId" member which must be a string.');
  }

  if (!this.content.policies) {
    this.content.policies = [];
  }

  this.content.policies.push(policy);

  return this;
};

/**
 * Set policies list
 * @param {Array} policies - must be an array of objects containing at least a "roleId" member which must be a string
 *
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.setPolicies = function (policies) {

  if (!Array.isArray(policies)) {
    throw new Error('Parameter "policies" must be an array of objects containing at least a "roleId" member which must be a string');
  }

  policies.map(function (policy) {
    if (typeof policy !== 'object' || typeof policy.roleId !== 'string') {
      throw new Error('Parameter "policies" must be an array of objects containing at least a "roleId" member which must be a string');
    }
  });

  this.content.policies = policies;

  return this;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this securityDocument
 */
KuzzleProfile.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

/**
 * Returns the list of policies associated to this profile.
 * Each policy element is an array of objects containing at least a "roleId" member which must be a string
 *
 * @return {object} an array of policies
 */
KuzzleProfile.prototype.getPolicies = function () {
  return this.content.policies;
};

module.exports = KuzzleProfile;

},{"./kuzzleSecurityDocument":15}],13:[function(require,module,exports){
var KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleRole(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteRole'
    },
    updateActionName: {
      value: 'updateRole'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleRole.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleRole
  }
});

/**
 * Saves this role into Kuzzle.
 *
 * If this is a new role, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this role in Kuzzle by the current content
 * of this object.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleRole.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceRole'), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });
};

module.exports = KuzzleRole;
},{"./kuzzleSecurityDocument":15}],14:[function(require,module,exports){
var
  KuzzleRole = require('./kuzzleRole'),
  KuzzleProfile = require('./kuzzleProfile'),
  KuzzleUser = require('./kuzzleUser');

/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @returns {KuzzleSecurity}
 * @constructor
 */
function KuzzleSecurity(kuzzle) {

  Object.defineProperty(this, 'kuzzle', {
    value: kuzzle
  });

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (action) {
      return {
        controller: 'security',
        action: action
      };
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['roleFactory', 'profileFactory', 'userFactory', 'isActionAllowed'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}


/**
 * Retrieve a single Role using its unique role ID.
 *
 * @param {string} id
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getRole = function (id, options, cb) {
  var
    data,
    self = this;

  if (!id) {
    throw new Error('Id parameter is mandatory for getRole function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = {_id: id};

  self.kuzzle.callbackRequired('KuzzleSecurity.getRole', cb);

  self.kuzzle.query(this.buildQueryArgs('getRole'), data, options, function (err, response) {
    if (err) {
      return cb(err);
    }

    cb(null, new KuzzleRole(self, response.result._id, response.result._source));
  });
};

/**
 * Executes a search on roles according to a filter
 *
 * /!\ There is a small delay between role creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a role that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `indexes` with a list of index id, a integer `from` and a integer `size`
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 */
KuzzleSecurity.prototype.searchRoles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchRoles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchRoles'), {body: filters}, options, function (error, result) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = result.result.hits.map(function (doc) {
      return new KuzzleRole(self, doc._id, doc._source);
    });

    cb(null, { total: result.result.total, roles: documents });
  });
};

/**
 * Create a new role in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same role already exists: throw an error if sets to false.
 *        Replace the existing role otherwise
 *
 * @param {string} id - role identifier
 * @param {object} content - a plain javascript object representing the role
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createRole = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createRole';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createRole: cannot create a role without a role ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceRole' : 'createRole';
  }

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, options, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleRole(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }
};


/**
 * Update a role in Kuzzle.
 *
 * @param {string} id - role identifier
 * @param {object} content - a plain javascript object representing the role's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.updateRole = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateRole';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateRole: cannot update a role without a role ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, options, function (err) {
      if (err) {
        return cb(err);
      }

      cb(null, new KuzzleRole(self, id, content));
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }
};

/**
 * Delete role.
 *
 * There is a small delay between role deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a role that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Role id to delete
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurity.prototype.deleteRole = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteRole'), data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteRole'), data, options);
  }
};

/**
 * Instantiate a new KuzzleRole object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - role id
 * @param {object} content - role content
 * @constructor
 */
KuzzleSecurity.prototype.roleFactory = function(id, content) {
  return new KuzzleRole(this, id, content);
};


/**
 * Get a specific profile from kuzzle
 *
 *
 * @param {string} id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getProfile = function (id, options, cb) {
  var
    data,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for getProfile function');
  }


  data = {_id: id};

  self.kuzzle.callbackRequired('KuzzleSecurity.getProfile', cb);

  self.kuzzle.query(this.buildQueryArgs('getProfile'), data, options, function (error, response) {
    if (error) {
      return cb(error);
    }

    cb(null, new KuzzleProfile(self, response.result._id, response.result._source));
  });
};

/**
 * Executes a search on profiles according to a filter
 *
 *
 * /!\ There is a small delay between profile creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `roles` with a list of roles id, a integer `from` and a integer `size`
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchProfiles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchProfiles'), {body: filters}, options, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleProfile(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, profiles: documents });
  });
};

/**
 * Create a new profile in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same profile already exists: throw an error if sets to false.
 *        Replace the existing profile otherwise
 *
 * @param {string} id - profile identifier
 * @param {object} content - attribute `roles` in `content` must only contains an array of role id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createProfile = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createProfile: cannot create a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceProfile' : 'createProfile';
  }

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, options, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleProfile(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }
};


/**
 * Update a profile in Kuzzle.
 *
 * @param {string} id - profile identifier
 * @param {object} content - a plain javascript object representing the profile's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.updateProfile = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateProfile: cannot update a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, options, function (err, res) {
      var updatedContent = {};

      if (err) {
        return cb(err);
      }

      Object.keys(res.result._source).forEach(function (property) {
        updatedContent[property] = res.result._source[property];
      });

      cb(null, new KuzzleProfile(self, res.result._id, updatedContent));
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }
};

/**
 * Delete profile.
 *
 * There is a small delay between profile deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Profile id to delete
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurity.prototype.deleteProfile = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteProfile'), data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteProfile'), data, options);
  }
};

/**
 * Instantiate a new KuzzleProfile object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - profile id
 * @param {object} content - profile content
 * @constructor
 */
KuzzleSecurity.prototype.profileFactory = function(id, content) {
  return new KuzzleProfile(this, id, content);
};

/**
 * Get a specific user from kuzzle using its unique ID
 *
 * @param {string} id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getUser = function (id, options, cb) {
  var
    data,
    self = this;

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for getUser function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = {_id: id};

  self.kuzzle.callbackRequired('KuzzleSecurity.getUser', cb);

  self.kuzzle.query(this.buildQueryArgs('getUser'), data, options, function (err, response) {
    if (err) {
      return cb(err);
    }

    cb(null, new KuzzleUser(self, response.result._id, response.result._source));
  });
};

/**
 * Executes a search on user according to a filter
 *
 * /!\ There is a small delay between user creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a user that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - same filters as documents filters
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.searchUsers = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchUsers', cb);

  self.kuzzle.query(this.buildQueryArgs('searchUsers'), {body: filters}, options, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleUser(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, users: documents });
  });
};

/**
 * Create a new user in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same user already exists: throw an error if sets to false.
 *        Replace the existing user otherwise
 *
 * @param {string} id - user identifier
 * @param {object} content - attribute `profile` in `content` must only contains the profile id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createUser = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createUser';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createUser: cannot create a user without a user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceUser' : 'createUser';
  }

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, null, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleUser(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }
};


/**
 * Update an user in Kuzzle.
 *
 * @param {string} id - user identifier
 * @param {object} content - a plain javascript object representing the user's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.updateUser = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateUser';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateUser: cannot update an user without an user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, new KuzzleUser(self, res.result._id, res.result._source));
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data, options);
  }
};

/**
 * Delete user.
 *
 * There is a small delay between user deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a user that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Profile id to delete
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurity.prototype.deleteUser = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteUser'), data, options, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteUser'), data, options);
  }
};

/**
 * Instantiate a new KuzzleUser object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - user id
 * @param {object} content - user content
 * @constructor
 */
KuzzleSecurity.prototype.userFactory = function(id, content) {
  return new KuzzleUser(this, id, content);
};

/**
 * Tells whether an action is allowed, denied or conditional based on the rights
 * rights provided as the first argument. An action is defined as a couple of
 * action and controller (mandatory), plus an index and a collection(optional).
 *
 * @param {object} rights - The rights rights associated to a user
 *                            (see getMyrights and getUserrights).
 * @param {string} controller - The controller to check the action onto.
 * @param {string} action - The action to perform.
 * @param {string} index - (optional) The name of index to perform the action onto.
 * @param {string} collection - (optional) The name of the collection to perform the action onto.
 *
 * @returns {string} ['allowed', 'denied', 'conditional'] where conditional cases
 *                   correspond to rights containing closures.
 *                   See also http://kuzzle.io/guide/#roles-definition
 */
KuzzleSecurity.prototype.isActionAllowed = function(rights, controller, action, index, collection) {
  var filteredRights;

  if (!rights || typeof rights !== 'object') {
    throw new Error('rights parameter is mandatory for isActionAllowed function');
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error('controller parameter is mandatory for isActionAllowed function');
  }
  if (!action || typeof action !== 'string') {
    throw new Error('action parameter is mandatory for isActionAllowed function');
  }

  // We filter in all the rights that match the request (including wildcards).
  filteredRights = rights.filter(function (right) {
    return right.controller === controller || right.controller === '*';
  })
  .filter(function (right) {
    return right.action === action || right.action === '*';
  })
  .filter(function (right) {
    return right.index === index || right.index === '*';
  })
  .filter(function (right) {
    return right.collection === collection || right.collection === '*';
  });

  // Then, if at least one right allows the action, we return 'allowed'
  if (filteredRights.some(function (item) { return item.value === 'allowed'; })) {
    return 'allowed';
  }
  // If no right allows the action, we check for conditionals.
  if (filteredRights.some(function (item) { return item.value === 'conditional'; })) {
    return 'conditional';
  }
  // Otherwise we return 'denied'.
  return 'denied';
};


/**
 * Gets the rights array of a given user.
 *
 * @param {string} userId The id of the user.
 * @param {object} [options] - (optional) arguments
 * @param {function} cb   The callback containing the normalized array of rights.
 */
KuzzleSecurity.prototype.getUserRights = function (userId, options, cb) {
  var
    data = {_id: userId},
    self = this;

  if (!userId || typeof userId !== 'string') {
    throw new Error('userId parameter is mandatory for getUserRights function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Kuzzle.getUserRights', cb);

  this.kuzzle.query(this.buildQueryArgs('getUserRights'), data, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });
};

module.exports = KuzzleSecurity;

},{"./kuzzleProfile":12,"./kuzzleRole":13,"./kuzzleUser":16}],15:[function(require,module,exports){
function KuzzleSecurityDocument(kuzzleSecurity, id, content) {

  if (!id) {
    throw new Error('A security document must have an id');
  }

  // Define properties
  Object.defineProperties(this, {
    // private properties
    kuzzle: {
      value: kuzzleSecurity.kuzzle
    },
    kuzzleSecurity: {
      value: kuzzleSecurity
    },
    // read-only properties
    // writable properties
    id: {
      value: id,
      enumerable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    }
  });

  if (content) {
    this.setContent(content, true);
  }

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'update'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {Object} data - New securityDocument content
 * @return {Object} this
 */
KuzzleSecurityDocument.prototype.setContent = function (data) {
  this.content = data;
  return this;
};

/**
 * Serialize this object into a pojo
 *
 * @return {object} pojo representing this securityDocument
 */
KuzzleSecurityDocument.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

/**
 * Delete the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurityDocument.prototype.delete = function (options, cb) {
  var
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs(this.deleteActionName), {_id: this.id}, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, res.result._id);
    }
  });
};

/**
 * Update the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} content - Content to add to KuzzleSecurityDocument
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurityDocument.prototype.update = function (content, options, cb) {
  var
    data = {},
    self = this;

  if (typeof content !== 'object') {
    throw new Error('Parameter "content" must be a object');
  }

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = self.id;
  data.body = content;

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs(this.updateActionName), data, options, function (error, response) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.setContent(response.result._source);

    if (cb) {
      cb(null, self);
    }
  });
};

module.exports = KuzzleSecurityDocument;
},{}],16:[function(require,module,exports){
var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleUser(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteUser'
    },
    updateActionName: {
      value: 'updateUser'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

KuzzleUser.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleUser
  }
});

/**
 * Set profiles in content
 * @param {array} profile - an array of profiles ids string
 *
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.setProfiles = function (profilesIds) {
  if (!Array.isArray(profilesIds) || typeof profilesIds[0] !== 'string') {
    throw new Error('Parameter "profilesIds" must be an array of strings');
  }

  this.content.profilesIds = profilesIds;

  return this;
};

/**
 * Add a profile
 * @param {string} profile - a profile ids string
 *
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.addProfile = function (profileId) {
  if (typeof profileId !== 'string') {
    throw new Error('Parameter "profileId" must be a string');
  }

  if (!this.content.profilesIds) {
    this.content.profilesIds = [];
  }

  if (this.content.profilesIds.indexOf(profileId) === -1) {
    this.content.profilesIds.push(profileId);
  }

  return this;
};

/**
 * Saves this user into Kuzzle.
 *
 * If this is a new user, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this user in Kuzzle by the current content
 * of this object.
 *
 * @param {responseCallback} [cb] - Handles the query response
 * @param {object} [options] - Optional parameters
 * @returns {*} this
 */
KuzzleUser.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceUser'), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this User
 */
KuzzleUser.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

/**
 * Return the associated profiles IDs
 *
 * @return {array} the associated profiles IDs
 */
KuzzleUser.prototype.getProfiles = function () {
  return this.content.profilesIds;
};

module.exports = KuzzleUser;

},{"./kuzzleSecurityDocument":15}]},{},[3]);
