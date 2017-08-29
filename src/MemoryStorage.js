// Parameter mutualization
var
  getId = {getter: true, required: ['_id']},
  getIdField = {getter: true, required: ['_id', 'field']},
  getKeys = {getter: true, required: ['keys']},
  getMember = {getter: true, required: ['_id', 'member']},
  getxScan = {
    getter: true, 
    required: ['_id', 'cursor'], 
    opts: ['match', 'count'],
    mapResults: mapScanResults
  },
  getZrange = {
    getter: true,
    required: ['_id', 'start', 'stop'],
    opts: assignZrangeOptions,
    mapResults: mapZrangeResults
  },
  getZrangeBy = {
    getter: true,
    required: ['_id', 'min', 'max'],
    opts: assignZrangeOptions,
    mapResults: mapZrangeResults
  },
  setId = {required: ['_id']},
  setIdValue = {required: ['_id', 'value']},
  setIdFieldValue = {required: ['_id', 'field', 'value']},
  setEntries = {required: ['entries']};

// Redis commands
var
  commands = {
    append: setIdValue,
    bitcount: {getter: true, required: ['_id'], opts: ['start', 'end']},
    bitop: {required: ['_id', 'operation', 'keys']},
    bitpos: {getter: true, required: ['_id', 'bit'], opts: ['start', 'end']},
    dbsize: {getter: true},
    decr: setId,
    decrby: setIdValue,
    del: {required: ['keys']},
    exists: getKeys,
    expire: {required: ['_id', 'seconds']},
    expireat: {required: ['_id', 'timestamp']},
    flushdb: {},
    geoadd: {required: ['_id', 'points']},
    geodist: {
      getter: true,
      required: ['_id', 'member1', 'member2'],
      opts: ['unit'],
      mapResults: parseFloat
    },
    geohash: {getter: true, required: ['_id', 'members']},
    geopos: {getter: true, required: ['_id', 'members'], mapResults: mapGeoposResults},
    georadius: {
      getter: true,
      required: ['_id', 'lon', 'lat', 'distance', 'unit'],
      opts: assignGeoRadiusOptions,
      mapResults: mapGeoRadiusResults
    },
    georadiusbymember: {
      getter: true,
      required: ['_id', 'member', 'distance', 'unit'],
      opts: assignGeoRadiusOptions,
      mapResults: mapGeoRadiusResults
    },
    get: getId,
    getbit: {getter: true, required: ['_id', 'offset']},
    getrange: {getter: true, required: ['_id', 'start', 'end']},
    getset: setIdValue,
    hdel: {required: ['_id', 'fields']},
    hexists: getIdField,
    hget: getIdField,
    hgetall: {getter: true, required: ['_id']},
    hincrby: setIdFieldValue,
    hincrbyfloat: {required: ['_id', 'field', 'value'], mapResults: parseFloat},
    hkeys: getId,
    hlen: getId,
    hmget: {getter: true, required: ['_id', 'fields']},
    hmset: {required: ['_id', 'entries']},
    hscan: getxScan,
    hset: setIdFieldValue,
    hsetnx: setIdFieldValue,
    hstrlen: getIdField,
    hvals: getId,
    incr: setId,
    incrby: setIdValue,
    incrbyfloat: {required: ['_id', 'value'], mapResults: parseFloat},
    keys: {getter: true, required: ['pattern']},
    lindex: {getter: true, required: ['_id', 'idx']},
    linsert: {required: ['_id', 'position', 'pivot', 'value']},
    llen: getId,
    lpop: setId,
    lpush: {required: ['_id', 'values']},
    lpushx: setIdValue,
    lrange: {getter: true, required: ['_id', 'start', 'stop']},
    lrem: {required: ['_id', 'count', 'value']},
    lset: {required: ['_id', 'index', 'value']},
    ltrim: {required: ['_id', 'start', 'stop']},
    mget: getKeys,
    mset: setEntries,
    msetnx: setEntries,
    object: {getter: true, required: ['_id', 'subcommand']},
    persist: setId,
    pexpire: {required: ['_id', 'milliseconds']},
    pexpireat: {required: ['_id', 'timestamp']},
    pfadd: {required: ['_id', 'elements']},
    pfcount: getKeys,
    pfmerge: {required: ['_id', 'sources']},
    ping: {getter: true},
    psetex: {required: ['_id', 'value', 'milliseconds']},
    pttl: getId,
    randomkey: {getter: true},
    rename: {required: ['_id', 'newkey']},
    renamenx: {required: ['_id', 'newkey']},
    rpop: setId,
    rpoplpush: {required: ['source', 'destination']},
    rpush: {required: ['_id', 'values']},
    rpushx: setIdValue,
    sadd: {required: ['_id', 'members']},
    scan: {getter: true, required: ['cursor'], opts: ['match', 'count'], mapResults: mapScanResults},
    scard: getId,
    sdiff: {getter: true, required: ['_id', 'keys']},
    sdiffstore: {required: ['_id', 'keys', 'destination']},
    set: {required: ['_id', 'value'], opts: ['ex', 'px', 'nx', 'xx']},
    setex: {required: ['_id', 'value', 'seconds']},
    setnx: setIdValue,
    sinter: getKeys,
    sinterstore: {required: ['destination', 'keys']},
    sismember: getMember,
    smembers: getId,
    smove: {required: ['_id', 'destination', 'member']},
    sort: {getter: true, required: ['_id'], opts: ['alpha', 'by', 'direction', 'get', 'limit']},
    spop: {required: ['_id'], opts: ['count'], mapResults: mapStringToArray },
    srandmember: {getter: true, required: ['_id'], opts: ['count'], mapResults: mapStringToArray},
    srem: {required: ['_id', 'members']},
    sscan: getxScan,
    strlen: getId,
    sunion: getKeys,
    sunionstore: {required: ['destination', 'keys']},
    time: {getter: true, mapResults: mapArrayStringToArrayInt},
    touch: {required: ['keys']},
    ttl: getId,
    type: getId,
    zadd: {required: ['_id', 'elements'], opts: ['nx', 'xx', 'ch', 'incr']},
    zcard: getId,
    zcount: {getter: true, required: ['_id', 'min', 'max']},
    zincrby: {required: ['_id', 'member', 'value']},
    zinterstore: {required: ['_id', 'keys'], opts: ['weights', 'aggregate']},
    zlexcount: {getter: true, required: ['_id', 'min', 'max']},
    zrange: getZrange,
    zrangebylex: {getter: true, required: ['_id', 'min', 'max'], opts: ['limit']},
    zrevrangebylex: {getter: true, required: ['_id', 'min', 'max'], opts: ['limit']},
    zrangebyscore: getZrangeBy,
    zrank: getMember,
    zrem: {required: ['_id', 'members']},
    zremrangebylex: {required: ['_id', 'min', 'max']},
    zremrangebyrank: {required: ['_id', 'start', 'stop']},
    zremrangebyscore: {required: ['_id', 'min', 'max']},
    zrevrange: getZrange,
    zrevrangebyscore: getZrangeBy,
    zrevrank: getMember,
    zscan: getxScan,
    zscore: {getter: true, required: ['_id', 'member'], mapResults: parseFloat},
    zunionstore: {required: ['_id', 'keys'], opts: ['weights', 'aggregate']}
  };

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
 * lowercased), except functions falling in the following categories:
 *
 *  - blocking functions
 *  - cluster commands
 *  - configuration commands
 *  - cursor functions
 *  - database administration commands
 *  - debugging functions
 *  - script based functions
 *  - transaction functions
 *
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @constructor
 */
function MemoryStorage(kuzzle) {
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

// Dynamically builds this class' prototypes using the "commands" global variable
(function () {
  Object.keys(commands).forEach(function (command) {
    MemoryStorage.prototype[command] = function () {
      var
        args = Array.prototype.slice.call(arguments),
        options = null,
        cb,
        query = {
          controller: 'ms',
          action: command
        },
        data = {};

      if (args.length && typeof args[args.length - 1] === 'function') {
        cb = args.pop();
      }

      commands[command].getter && this.kuzzle.callbackRequired('MemoryStorage.' + command, cb);

      if (!commands[command].getter) {
        data.body = {};
      }

      if (commands[command].required) {
        commands[command].required.forEach(function (param) {
          var value = args.shift();

          if (value === undefined) {
            throw new Error('MemoryStorage.' + command + ': Missing parameter "' + param + '"');
          }

          assignParameter(data, commands[command].getter, param, value);
        });
      }

      if (args.length > 1) {
        throw new Error('MemoryStorage.' + command + ': Too many parameters provided');
      }

      if (args.length === 1 && typeof args[0] !== 'object' || Array.isArray(args[0])) {
        throw new Error('MemoryStorage.' + command + ': Invalid optional parameter (expected an object)');
      }

      if (args.length) {
        options = Object.assign({}, args[0]);

        if (Array.isArray(commands[command].opts)) {
          commands[command].opts.forEach(function (opt) {
            if (options[opt] !== null && options[opt] !== undefined) {
              assignParameter(data, commands[command].getter, opt, options[opt]);
              delete options[opt];
            }
          });
        }
      }

      /*
       Options function mapper does not necessarily need
       options to be passed by clients.
       */
      if (typeof commands[command].opts === 'function') {
        commands[command].opts(data, options || {});
      }

      this.kuzzle.query(query, data, options, cb && function (err, res) {
        if (err) {
          return cb(err);
        }

        if (commands[command].mapResults) {
          return cb(null, commands[command].mapResults(res.result));
        }

        cb(null, res.result);
      });

      if (!commands[command].getter) {
        return this;
      }
    };
  });
})();

/**
 *
 * @param {object} data - target data object
 * @param {boolean} getter - tells if the command is a getter one
 * @param {string} name - parameter name
 * @param {*} value - parameter value
 */
function assignParameter(data, getter, name, value) {
  if (getter || name === '_id') {
    data[name] = value;
  }
  else {
    data.body[name] = value;
  }
}

/**
 * Assign the provided options for the georadius* redis functions
 * to the request object, as expected by Kuzzle API
 *
 * Mutates the provided data and options objects
 *
 * @param {object} data
 * @param {object} options
 */
function assignGeoRadiusOptions(data, options) {
  var parsed = [];

  Object.keys(options)
    .filter(function (opt) {
      return options[opt] && ['withcoord', 'withdist', 'count', 'sort'].indexOf(opt) !== -1;
    })
    .forEach(function (opt) {
      if (opt === 'withcoord' || opt === 'withdist') {
        parsed.push(opt);
        delete options[opt];
      }
      else if (opt === 'count' || opt === 'sort') {
        if (opt === 'count') {
          parsed.push('count');
        }

        parsed.push(options[opt]);
      }

      delete options[opt];
    });

  if (parsed.length > 0) {
    data.options = parsed;
  }
}

/**
 * Force the WITHSCORES option on z*range* routes
 *
 * Mutates the provided data and options objects
 *
 * @param {object} data
 * @param {object} options
 */
function assignZrangeOptions(data, options) {
  data.options = ['withscores'];

  if (options.limit) {
    data.limit = options.limit;
    delete options.limit;
  }
}

/**
 * Maps geopos results, from array<array<string>> to array<array<number>>
 *
 * @param {Array.<Array.<string>>} results
 * @return {Array.<Array.<Number>>}
 */
function mapGeoposResults(results) {
  return results.map(function (coords) {
    return coords.map(function (latlon) {
      return parseFloat(latlon);
    });
  });
}


/**
 * Maps georadius results to the format specified in the SDK documentation,
 * preventing different formats depending on the passed options
 *
 * Results can be either an array of point names, or an array
 * of arrays, each one of them containing the point name,
 * and additional informations depending on the passed options
 * (coordinates, distances)
 *
 * @param {Array} results
 * @return {Array.<Object>}
 */
function mapGeoRadiusResults(results) {
  // Simple array of point names (no options provided)
  if (!Array.isArray(results[0])) {
    return results.map(function (point) {
      return {name: point};
    });
  }

  return results.map(function (point) {
    // The point id is always the first item
    var p = {
        name: point[0]
      },
      i;

    for (i = 1; i < point.length; i++) {
      // withcoord result are in an array...
      if (Array.isArray(point[i])) {
        p.coordinates = point[i].map(function (coord) {
          return parseFloat(coord);
        });
      }
      else {
        // ... and withdist are not
        p.distance = parseFloat(point[i]);
      }
    }

    return p;
  });
}

/**
 * Map a string result to an array of strings.
 * Used to uniformize polymorphic results from redis
 *
 * @param {Array|string} results
 * @return {Array.<string>}
 */
function mapStringToArray (results) {
  return Array.isArray(results) ? results : [results];
}

/**
 * Map an array of strings to an array of integers
 *
 * @param {Array.<string>} results
 * @return {Array.<Number>}
 */
function mapArrayStringToArrayInt(results) {
  return results.map(function (value) {
    return parseInt(value);
  });
}

/**
 * Map zrange results with WITHSCORES:
 * [
 *  "member1",
 *  "score of member1",
 *  "member2",
 *  "score of member2"
 * ]
 *
 * into the following format:
 * [
 *  {"member": "member1", "score": <score of member1>},
 *  {"member": "member2", "score": <score of member2>},
 * ]
 *
 *
 * @param {Array.<string>} results
 * @return {Array.<Object>}
 */
function mapZrangeResults(results) {
  var
    buffer = null,
    mapped = [];

  results.forEach(function (value) {
    if (buffer === null) {
      buffer = value;
    }
    else {
      mapped.push({member: buffer, score: parseFloat(value)});
      buffer = null;
    }
  });

  return mapped;
}

/**
 * Map *scan calls results, from:
 * [
 *   "<cursor>",
 *   [
 *     "value1",
 *     "value2", 
 *     "..."
 *   ]
 * ]
 *
 * To:
 * {
 *   cursor: <cursor>,
 *   values: [
 *     "value1",
 *     "value2",
 *     "..."
 *   ]
 * }
 * 
 * @param  {array.<string|array>} results 
 * @return {object}
 */
function mapScanResults(results) {
  return {
    cursor: results[0],
    values: results[1]
  };
}

module.exports = MemoryStorage;
