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

module.exports = MemoryStorage;
