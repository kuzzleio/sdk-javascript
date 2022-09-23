const { BaseController } = require("./Base");

/* eslint sort-keys: 0 */

// Parameter mutualization
const getId = { getter: true, required: ["_id"] };
const getIdField = { getter: true, required: ["_id", "field"] };
const getKeys = { getter: true, required: ["keys"] };
const getMember = { getter: true, required: ["_id", "member"] };
const getxScan = {
  getter: true,
  required: ["_id", "cursor"],
  opts: ["match", "count"],
  mapResults: mapScanResults,
};
const getZrange = {
  getter: true,
  required: ["_id", "start", "stop"],
  opts: assignZrangeOptions,
  mapResults: mapZrangeResults,
};
const getZrangeBy = {
  getter: true,
  required: ["_id", "min", "max"],
  opts: assignZrangeOptions,
  mapResults: mapZrangeResults,
};
const setId = { required: ["_id"] };
const setIdValue = { required: ["_id", "value"] };

// Redis commands
const commands = {
  append: setIdValue,
  bitcount: { getter: true, required: ["_id"], opts: ["start", "end"] },
  bitop: { required: ["_id", "operation", "keys"] },
  bitpos: { getter: true, required: ["_id", "bit"], opts: ["start", "end"] },
  dbsize: { getter: true },
  decr: setId,
  decrby: setIdValue,
  del: { required: ["keys"] },
  exists: getKeys,
  expire: { required: ["_id", "seconds"], mapResults: Boolean },
  expireat: { required: ["_id", "timestamp"], mapResults: Boolean },
  flushdb: { mapResults: mapNoResult },
  geoadd: { required: ["_id", "points"] },
  geodist: {
    getter: true,
    required: ["_id", "member1", "member2"],
    opts: ["unit"],
    mapResults: parseFloat,
  },
  geohash: { getter: true, required: ["_id", "members"] },
  geopos: {
    getter: true,
    required: ["_id", "members"],
    mapResults: mapGeoposResults,
  },
  georadius: {
    getter: true,
    required: ["_id", "lon", "lat", "distance", "unit"],
    opts: assignGeoRadiusOptions,
    mapResults: mapGeoRadiusResults,
  },
  georadiusbymember: {
    getter: true,
    required: ["_id", "member", "distance", "unit"],
    opts: assignGeoRadiusOptions,
    mapResults: mapGeoRadiusResults,
  },
  get: getId,
  getbit: { getter: true, required: ["_id", "offset"] },
  getrange: { getter: true, required: ["_id", "start", "end"] },
  getset: setIdValue,
  hdel: { required: ["_id", "fields"] },
  hexists: { getter: true, required: ["_id", "field"], mapResults: Boolean },
  hget: getIdField,
  hgetall: { getter: true, required: ["_id"] },
  hincrby: { required: ["_id", "field", "value"] },
  hincrbyfloat: { required: ["_id", "field", "value"], mapResults: parseFloat },
  hkeys: getId,
  hlen: getId,
  hmget: { getter: true, required: ["_id", "fields"] },
  hmset: { required: ["_id", "entries"], mapResults: mapNoResult },
  hscan: getxScan,
  hset: { required: ["_id", "field", "value"], mapResults: Boolean },
  hsetnx: { required: ["_id", "field", "value"], mapResults: Boolean },
  hstrlen: getIdField,
  hvals: getId,
  incr: setId,
  incrby: setIdValue,
  incrbyfloat: { required: ["_id", "value"], mapResults: parseFloat },
  keys: { getter: true, required: ["pattern"] },
  lindex: { getter: true, required: ["_id", "idx"] },
  linsert: { required: ["_id", "position", "pivot", "value"] },
  llen: getId,
  lpop: setId,
  lpush: { required: ["_id", "values"] },
  lpushx: setIdValue,
  lrange: { getter: true, required: ["_id", "start", "stop"] },
  lrem: { required: ["_id", "count", "value"] },
  lset: { required: ["_id", "index", "value"], mapResults: mapNoResult },
  ltrim: { required: ["_id", "start", "stop"], mapResults: mapNoResult },
  mexecute: { required: ["actions"] },
  mget: getKeys,
  mset: { required: ["entries"], mapResults: mapNoResult },
  msetnx: { required: ["entries"], mapResults: Boolean },
  object: { getter: true, required: ["_id", "subcommand"] },
  persist: { required: ["_id"], mapResults: Boolean },
  pexpire: { required: ["_id", "milliseconds"], mapResults: Boolean },
  pexpireat: { required: ["_id", "timestamp"], mapResults: Boolean },
  pfadd: { required: ["_id", "elements"], mapResults: Boolean },
  pfcount: getKeys,
  pfmerge: { required: ["_id", "sources"], mapResults: mapNoResult },
  ping: { getter: true },
  psetex: {
    required: ["_id", "value", "milliseconds"],
    mapResults: mapNoResult,
  },
  pttl: getId,
  randomkey: { getter: true },
  rename: { required: ["_id", "newkey"], mapResults: mapNoResult },
  renamenx: { required: ["_id", "newkey"], mapResults: Boolean },
  rpop: setId,
  rpoplpush: { required: ["source", "destination"] },
  rpush: { required: ["_id", "values"] },
  rpushx: setIdValue,
  sadd: { required: ["_id", "members"] },
  scan: {
    getter: true,
    required: ["cursor"],
    opts: ["match", "count"],
    mapResults: mapScanResults,
  },
  scard: getId,
  sdiff: { getter: true, required: ["_id", "keys"] },
  sdiffstore: { required: ["_id", "keys", "destination"] },
  set: {
    required: ["_id", "value"],
    opts: ["ex", "px", "nx", "xx"],
    mapResults: mapNoResult,
  },
  setex: { required: ["_id", "value", "seconds"], mapResults: mapNoResult },
  setnx: { required: ["_id", "value"], mapResults: Boolean },
  sinter: getKeys,
  sinterstore: { required: ["destination", "keys"] },
  sismember: { getter: true, required: ["_id", "member"], mapResults: Boolean },
  smembers: getId,
  smove: { required: ["_id", "destination", "member"], mapResults: Boolean },
  sort: {
    required: ["_id"],
    opts: ["alpha", "by", "direction", "get", "limit"],
  },
  spop: { required: ["_id"], opts: ["count"], mapResults: mapStringToArray },
  srandmember: {
    getter: true,
    required: ["_id"],
    opts: ["count"],
    mapResults: mapStringToArray,
  },
  srem: { required: ["_id", "members"] },
  sscan: getxScan,
  strlen: getId,
  sunion: getKeys,
  sunionstore: { required: ["destination", "keys"] },
  time: { getter: true, mapResults: mapArrayStringToArrayInt },
  touch: { required: ["keys"] },
  ttl: getId,
  type: getId,
  zadd: { required: ["_id", "elements"], opts: ["nx", "xx", "ch", "incr"] },
  zcard: getId,
  zcount: { getter: true, required: ["_id", "min", "max"] },
  zincrby: { required: ["_id", "member", "value"] },
  zinterstore: { required: ["_id", "keys"], opts: ["weights", "aggregate"] },
  zlexcount: { getter: true, required: ["_id", "min", "max"] },
  zrange: getZrange,
  zrangebylex: {
    getter: true,
    required: ["_id", "min", "max"],
    opts: ["limit"],
  },
  zrevrangebylex: {
    getter: true,
    required: ["_id", "min", "max"],
    opts: ["limit"],
  },
  zrangebyscore: getZrangeBy,
  zrank: getMember,
  zrem: { required: ["_id", "members"] },
  zremrangebylex: { required: ["_id", "min", "max"] },
  zremrangebyrank: { required: ["_id", "start", "stop"] },
  zremrangebyscore: { required: ["_id", "min", "max"] },
  zrevrange: getZrange,
  zrevrangebyscore: getZrangeBy,
  zrevrank: getMember,
  zscan: getxScan,
  zscore: { getter: true, required: ["_id", "member"], mapResults: parseFloat },
  zunionstore: { required: ["_id", "keys"], opts: ["weights", "aggregate"] },
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
class MemoryStorageController extends BaseController {
  constructor(kuzzle) {
    super(kuzzle, "ms");
  }
}

// Dynamically builds this class' prototypes using the "commands" global variable
for (const action of Object.keys(commands)) {
  // eslint-disable-next-line no-loop-func
  MemoryStorageController.prototype[action] = function (...args) {
    const command = commands[action];
    const request = {
      action,
    };
    const options = {};

    if (!command.getter) {
      request.body = {};
    }

    for (const param of command.required || []) {
      const value = args.shift();

      if (value === undefined) {
        throw new Error(`ms.${action}: missing parameter ${param}`);
      }

      assignParameter(request, command.getter, param, value);
    }

    if (args.length > 1) {
      throw new Error(`ms.${action}: too many parameters provided`);
    }

    if (args.length) {
      if (typeof args[0] !== "object" || Array.isArray(args[0])) {
        throw new Error(
          `ms.${action}: invalid optional paramater (expected an object`
        );
      }

      Object.assign(options, args[0]);

      if (Array.isArray(command.opts)) {
        for (const opt of command.opts) {
          if (options[opt] !== null && options[opt] !== undefined) {
            assignParameter(request, command.getter, opt, options[opt]);
          }
        }
      }
    }

    /*
     Options function mapper does not necessarily need
     options to be passed by clients.
     */
    if (typeof command.opts === "function") {
      command.opts(request, options);
    }

    return this.query(request, options).then((response) => {
      if (command.mapResults) {
        return command.mapResults(response.result);
      }
      return response.result;
    });
  };
}

/**
 *
 * @param {object} data - target data object
 * @param {boolean} getter - tells if the command is a getter one
 * @param {string} name - parameter name
 * @param {*} value - parameter value
 */
function assignParameter(data, getter, name, value) {
  if (getter || name === "_id") {
    data[name] = value;
  } else {
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
  const parsed = [];

  Object.keys(options)
    .filter(function (opt) {
      return (
        options[opt] &&
        ["withcoord", "withdist", "count", "sort"].indexOf(opt) !== -1
      );
    })
    .forEach(function (opt) {
      if (opt === "withcoord" || opt === "withdist") {
        parsed.push(opt);
      } else if (opt === "count" || opt === "sort") {
        if (opt === "count") {
          parsed.push("count");
        }

        parsed.push(options[opt]);
      }
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
  data.options = ["withscores"];

  if (options.limit) {
    data.limit = options.limit;
  }
}

/**
 * Maps geopos results, from array<string[]> to array<array<number>>
 *
 * @param {Array.<Array.<string>>} results
 * @return {Array.<Array.<Number>>}
 */
function mapGeoposResults(results) {
  return results.map((coords) => coords.map(parseFloat));
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
      return { name: point };
    });
  }

  return results.map(function (point) {
    // The point id is always the first item
    const p = {
      name: point.shift(),
    };

    for (const elem of point) {
      if (Array.isArray(elem)) {
        // withcoord result are in an array...
        p.coordinates = elem.map(parseFloat);
      } else {
        // ... and withdist are not
        p.distance = parseFloat(elem);
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
function mapStringToArray(results) {
  return Array.isArray(results) ? results : [results];
}

/**
 * Map an array of strings to an array of integers
 *
 * @param {Array.<string>} results
 * @return {Array.<Number>}
 */
function mapArrayStringToArrayInt(results) {
  return results.map((x) => parseInt(x));
}

/**
 * Disable results for routes like flushdb
 * @return {undefined}
 */
function mapNoResult() {}

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
  const mapped = [];

  for (let i = 0; i < results.length; i += 2) {
    mapped.push({
      member: results[i],
      score: parseFloat(results[i + 1]),
    });
  }

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
    values: results[1],
  };
}

module.exports = { MemoryStorageController };
