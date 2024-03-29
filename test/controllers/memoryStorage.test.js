const {
    MemoryStorageController,
  } = require("../../src/controllers/MemoryStorage"),
  should = require("should"),
  sinon = require("sinon");

describe("MemoryStorage Controller", function () {
  let kuzzle;

  beforeEach(function () {
    kuzzle = {
      query: sinon.stub().resolves({ result: "foo" }),
    };
    kuzzle.ms = new MemoryStorageController(kuzzle);
  });

  const testReadCommand = (
    command,
    args,
    opts,
    expArgs,
    expOpts,
    result,
    expected
  ) => {
    kuzzle.query.reset();
    kuzzle.query.resolves({ result });

    return kuzzle.ms[command](...args.concat(opts)).then((res) => {
      should(res).eql(expected);

      should(kuzzle.query)
        .be.calledOnce()
        .be.calledWith(
          Object.assign(
            {
              controller: "ms",
              action: command,
            },
            expArgs,
            expOpts
          )
        );
    });
  };

  const testWriteCommand = (
    command,
    args,
    opts,
    expArgs,
    expOpts,
    result,
    expected
  ) => {
    if (!expArgs.body) {
      expArgs.body = {};
    }

    kuzzle.query.resolves({ result });

    return kuzzle.ms[command](...args.concat(opts)).then((res) => {
      should(res).eql(expected);

      should(kuzzle.query)
        .be.calledOnce()
        .be.calledWith(
          Object.assign(
            {
              controller: "ms",
              action: command,
            },
            expArgs,
            expOpts
          )
        );

      return kuzzle.ms[command](...args.concat(opts));
    });
  };

  it("#append", function () {
    return testWriteCommand(
      "append",
      ["key", "value"],
      {},
      { _id: "key", body: { value: "value" } },
      {},
      123,
      123
    );
  });

  it("#bitcount", function () {
    return testReadCommand(
      "bitcount",
      ["key"],
      { start: 2, end: 42 },
      { _id: "key" },
      { start: 2, end: 42 },
      123,
      123
    );
  });

  it("#bitop", function () {
    return testWriteCommand(
      "bitop",
      ["key", "and", ["foo", "bar"]],
      {},
      { _id: "key", body: { operation: "and", keys: ["foo", "bar"] } },
      {},
      123,
      123
    );
  });

  it("#bitpos", function () {
    return testReadCommand(
      "bitpos",
      ["key", 0],
      { start: 2, end: 42 },
      { _id: "key", bit: 0 },
      { start: 2, end: 42 },
      123,
      123
    );
  });

  it("#dbsize", function () {
    return testReadCommand("dbsize", [], {}, {}, {}, 123, 123);
  });

  it("#decr", function () {
    return testWriteCommand("decr", ["key"], {}, { _id: "key" }, {}, 123, 123);
  });

  it("#decrby", function () {
    return testWriteCommand(
      "decrby",
      ["key", 42],
      {},
      { _id: "key", body: { value: 42 } },
      {},
      123,
      123
    );
  });

  it("#del", function () {
    return testWriteCommand(
      "del",
      [["key1", "key2", "key3"]],
      {},
      { body: { keys: ["key1", "key2", "key3"] } },
      {},
      123,
      123
    );
  });

  it("#exists", function () {
    return testReadCommand(
      "exists",
      [["key1", "key2", "key3"]],
      {},
      { keys: ["key1", "key2", "key3"] },
      {},
      123,
      123
    );
  });

  it("#expire", function () {
    return testWriteCommand(
      "expire",
      ["key", 42],
      {},
      { _id: "key", body: { seconds: 42 } },
      {},
      0,
      false
    );
  });

  it("#expireat", function () {
    return testWriteCommand(
      "expireat",
      ["key", 123456789],
      {},
      { _id: "key", body: { timestamp: 123456789 } },
      {},
      1,
      true
    );
  });

  it("#flushdb", function () {
    return testWriteCommand("flushdb", [], {}, {}, {}, "OK", undefined);
  });

  it("#geoadd", function () {
    var points = [
      {
        lon: 13.361389,
        lat: 38.115556,
        name: "Palermo",
      },
      {
        lon: 15.087269,
        lat: 37.502669,
        name: "Catania",
      },
    ];

    return testWriteCommand(
      "geoadd",
      ["key", points],
      {},
      { _id: "key", body: { points: points } },
      {},
      1,
      1
    );
  });

  it("#geodist", function () {
    return testReadCommand(
      "geodist",
      ["key", "Palermo", "Catania"],
      { unit: "ft" },
      { _id: "key", member1: "Palermo", member2: "Catania" },
      { unit: "ft" },
      "12345.678",
      12345.678
    );
  });

  it("#geohash", function () {
    return testReadCommand(
      "geohash",
      ["key", ["Palermo", "Catania"]],
      {},
      { _id: "key", members: ["Palermo", "Catania"] },
      {},
      ["foo", "bar"],
      ["foo", "bar"]
    );
  });

  it("#geopos", function () {
    return testReadCommand(
      "geopos",
      ["key", ["Palermo", "Catania"]],
      {},
      { _id: "key", members: ["Palermo", "Catania"] },
      {},
      [
        ["123.45", "67.89"],
        ["3.14", "6.98"],
      ],
      [
        [123.45, 67.89],
        [3.14, 6.98],
      ]
    );
  });

  it("#georadius", function () {
    return testReadCommand(
      "georadius",
      ["key", 15, 37, 200, "km"],
      { count: 12, sort: "ASC", withcoord: true, withdist: true },
      { _id: "key", lon: 15, lat: 37, distance: 200, unit: "km" },
      { options: ["count", 12, "ASC", "withcoord", "withdist"] },
      [
        ["Palermo", "190.4424", ["13.36", "38.11"]],
        ["Catania", "56.44", ["15.08", "37.5"]],
      ],
      [
        { name: "Palermo", distance: 190.4424, coordinates: [13.36, 38.11] },
        { name: "Catania", distance: 56.44, coordinates: [15.08, 37.5] },
      ]
    ).then(function () {
      return testReadCommand(
        "georadius",
        ["key", 15, 37, 200, "km"],
        {},
        { _id: "key", lon: 15, lat: 37, distance: 200, unit: "km" },
        {},
        ["Palermo", "Catania"],
        [{ name: "Palermo" }, { name: "Catania" }]
      );
    });
  });

  it("#georadiusbymember", function () {
    return testReadCommand(
      "georadiusbymember",
      ["key", "Palermo", 200, "km"],
      { count: 12, sort: "ASC", withcoord: true, withdist: true },
      { _id: "key", member: "Palermo", distance: 200, unit: "km" },
      { options: ["count", 12, "ASC", "withcoord", "withdist"] },
      [
        ["Palermo", "190.4424", ["13.36", "38.11"]],
        ["Catania", "56.44", ["15.08", "37.5"]],
      ],
      [
        { name: "Palermo", distance: 190.4424, coordinates: [13.36, 38.11] },
        { name: "Catania", distance: 56.44, coordinates: [15.08, 37.5] },
      ]
    ).then(function () {
      return testReadCommand(
        "georadiusbymember",
        ["key", "Palermo", 200, "km"],
        {},
        { _id: "key", member: "Palermo", distance: 200, unit: "km" },
        {},
        ["Palermo", "Catania"],
        [{ name: "Palermo" }, { name: "Catania" }]
      );
    });
  });

  it("#get", function () {
    return testReadCommand(
      "get",
      ["key"],
      {},
      { _id: "key" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#getbit", function () {
    return testReadCommand(
      "getbit",
      ["key", 10],
      {},
      { _id: "key", offset: 10 },
      {},
      1,
      1
    );
  });

  it("#getrange", function () {
    return testReadCommand(
      "getrange",
      ["key", 2, 4],
      {},
      { _id: "key", start: 2, end: 4 },
      {},
      "bar",
      "bar"
    );
  });

  it("#getset", function () {
    return testWriteCommand(
      "getset",
      ["key", "foobar"],
      {},
      { _id: "key", body: { value: "foobar" } },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#hdel", function () {
    return testWriteCommand(
      "hdel",
      ["key", ["f1", "f2", "f3"]],
      {},
      { _id: "key", body: { fields: ["f1", "f2", "f3"] } },
      {},
      2,
      2
    );
  });

  it("#hexists", function () {
    return testReadCommand(
      "hexists",
      ["key", "field"],
      {},
      { _id: "key", field: "field" },
      {},
      0,
      false
    );
  });

  it("#hget", function () {
    return testReadCommand(
      "hget",
      ["key", "field"],
      {},
      { _id: "key", field: "field" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#hgetall", function () {
    return testReadCommand(
      "hgetall",
      ["key"],
      {},
      { _id: "key" },
      {},
      { foo: "bar", baz: "qux" },
      { foo: "bar", baz: "qux" }
    );
  });

  it("#hincrby", function () {
    return testWriteCommand(
      "hincrby",
      ["key", "field", 42],
      {},
      { _id: "key", body: { field: "field", value: 42 } },
      {},
      2,
      2
    );
  });

  it("#hincrbyfloat", function () {
    return testWriteCommand(
      "hincrbyfloat",
      ["key", "field", 3.14159],
      {},
      { _id: "key", body: { field: "field", value: 3.14159 } },
      {},
      "3.14159",
      3.14159
    );
  });

  it("#hkeys", function () {
    return testReadCommand(
      "hkeys",
      ["key"],
      {},
      { _id: "key" },
      {},
      ["foo", "bar", "baz", "qux"],
      ["foo", "bar", "baz", "qux"]
    );
  });

  it("#hlen", function () {
    return testReadCommand("hlen", ["key"], {}, { _id: "key" }, {}, 10, 10);
  });

  it("#hmget", function () {
    return testReadCommand(
      "hmget",
      ["key", ["f1", "f2", "f3"]],
      {},
      { _id: "key", fields: ["f1", "f2", "f3"] },
      {},
      ["foo", "bar", "baz", "qux"],
      ["foo", "bar", "baz", "qux"]
    );
  });

  it("#hmset", function () {
    var entries = [
      { field: "foo", value: "bar" },
      { field: "baz", value: "qux" },
    ];

    return testWriteCommand(
      "hmset",
      ["key", entries],
      {},
      { _id: "key", body: { entries: entries } },
      {},
      "OK",
      undefined
    );
  });

  it("#hscan", function () {
    return testReadCommand(
      "hscan",
      ["key", 0],
      { count: 42, match: "foo*" },
      { _id: "key", cursor: 0 },
      { count: 42, match: "foo*" },
      [42, ["bar", "baz", "qux"]],
      { cursor: 42, values: ["bar", "baz", "qux"] }
    );
  });

  it("#hset", function () {
    return testWriteCommand(
      "hset",
      ["key", "field", "value"],
      {},
      { _id: "key", body: { field: "field", value: "value" } },
      {},
      1,
      true
    );
  });

  it("#hsetnx", function () {
    return testWriteCommand(
      "hsetnx",
      ["key", "field", "value"],
      {},
      { _id: "key", body: { field: "field", value: "value" } },
      {},
      0,
      false
    );
  });

  it("#hstrlen", function () {
    return testReadCommand(
      "hstrlen",
      ["key", "field"],
      {},
      { _id: "key", field: "field" },
      {},
      10,
      10
    );
  });

  it("#hvals", function () {
    return testReadCommand(
      "hvals",
      ["key"],
      {},
      { _id: "key" },
      {},
      ["foo", "bar", "baz", "qux"],
      ["foo", "bar", "baz", "qux"]
    );
  });

  it("#incr", function () {
    return testWriteCommand("incr", ["key"], {}, { _id: "key" }, {}, 123, 123);
  });

  it("#incrby", function () {
    return testWriteCommand(
      "incrby",
      ["key", -3],
      {},
      { _id: "key", body: { value: -3 } },
      {},
      123,
      123
    );
  });

  it("#incrbyfloat", function () {
    return testWriteCommand(
      "incrbyfloat",
      ["key", -3.14],
      {},
      { _id: "key", body: { value: -3.14 } },
      {},
      "123.12",
      123.12
    );
  });

  it("#keys", function () {
    return testReadCommand(
      "keys",
      ["pattern"],
      {},
      { pattern: "pattern" },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#lindex", function () {
    return testReadCommand(
      "lindex",
      ["key", 3],
      {},
      { _id: "key", idx: 3 },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#linsert", function () {
    return testWriteCommand(
      "linsert",
      ["key", "after", "foo", "bar"],
      {},
      { _id: "key", body: { position: "after", pivot: "foo", value: "bar" } },
      {},
      4,
      4
    );
  });

  it("#llen", function () {
    return testReadCommand("llen", ["key"], {}, { _id: "key" }, {}, 4, 4);
  });

  it("#lpop", function () {
    return testWriteCommand(
      "lpop",
      ["key"],
      {},
      { _id: "key" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#lpush", function () {
    return testWriteCommand(
      "lpush",
      ["key", ["foo", "bar", "baz"]],
      {},
      { _id: "key", body: { values: ["foo", "bar", "baz"] } },
      {},
      4,
      4
    );
  });

  it("#lpushx", function () {
    return testWriteCommand(
      "lpushx",
      ["key", "foo"],
      {},
      { _id: "key", body: { value: "foo" } },
      {},
      4,
      4
    );
  });

  it("#lrange", function () {
    return testReadCommand(
      "lrange",
      ["key", 0, 1],
      {},
      { _id: "key", start: 0, stop: 1 },
      {},
      ["foo", "bar"],
      ["foo", "bar"]
    );
  });

  it("#lrem", function () {
    return testWriteCommand(
      "lrem",
      ["key", 1, "foo"],
      {},
      { _id: "key", body: { count: 1, value: "foo" } },
      {},
      1,
      1
    );
  });

  it("#lset", function () {
    return testWriteCommand(
      "lset",
      ["key", 1, "foo"],
      {},
      { _id: "key", body: { index: 1, value: "foo" } },
      {},
      "OK",
      undefined
    );
  });

  it("#ltrim", function () {
    return testWriteCommand(
      "ltrim",
      ["key", 1, 2],
      {},
      { _id: "key", body: { start: 1, stop: 2 } },
      {},
      "OK",
      undefined
    );
  });

  it("#mexecute", function () {
    const actions = [
      {
        action: "set",
        args: { _id: "list:a", body: { value: 1, ex: 100, nx: true } },
      },
      { action: "get", args: { _id: "list:a" } },
      { action: "del", args: { body: { keys: ["list:a"] } } },
    ];

    return testReadCommand(
      "mexecute",
      [actions],
      {},
      { body: { actions: actions } },
      {},
      [
        [null, "OK"],
        [null, "1"],
        [null, 1],
      ],
      [
        [null, "OK"],
        [null, "1"],
        [null, 1],
      ]
    );
  });

  it("#mget", function () {
    return testReadCommand(
      "mget",
      [["k1", "k2", "k3"]],
      {},
      { keys: ["k1", "k2", "k3"] },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#mset", function () {
    var entries = [
      { key: "foo", value: "bar" },
      { key: "baz", value: "qux" },
    ];

    return testWriteCommand(
      "mset",
      [entries],
      {},
      { body: { entries: entries } },
      {},
      "OK",
      undefined
    );
  });

  it("#msetnx", function () {
    var entries = [
      { key: "foo", value: "bar" },
      { key: "baz", value: "qux" },
    ];

    return testWriteCommand(
      "msetnx",
      [entries],
      {},
      { body: { entries: entries } },
      {},
      1,
      true
    );
  });

  it("#object", function () {
    return testReadCommand(
      "object",
      ["key", "encoding"],
      {},
      { _id: "key", subcommand: "encoding" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#persist", function () {
    return testWriteCommand(
      "persist",
      ["key"],
      {},
      { _id: "key" },
      {},
      1,
      true
    );
  });

  it("#pexpire", function () {
    return testWriteCommand(
      "pexpire",
      ["key", 42000],
      {},
      { _id: "key", body: { milliseconds: 42000 } },
      {},
      0,
      false
    );
  });

  it("#pexpireat", function () {
    return testWriteCommand(
      "pexpireat",
      ["key", 123456789],
      {},
      { _id: "key", body: { timestamp: 123456789 } },
      {},
      1,
      true
    );
  });

  it("#pfadd", function () {
    return testWriteCommand(
      "pfadd",
      ["key", ["foo", "bar", "baz"]],
      {},
      { _id: "key", body: { elements: ["foo", "bar", "baz"] } },
      {},
      0,
      false
    );
  });

  it("#pfcount", function () {
    return testReadCommand(
      "pfcount",
      [["k1", "k2", "k3"]],
      {},
      { keys: ["k1", "k2", "k3"] },
      {},
      42,
      42
    );
  });

  it("#pfmerge", function () {
    return testWriteCommand(
      "pfmerge",
      ["key", ["key1", "key2", "key3"]],
      {},
      { _id: "key", body: { sources: ["key1", "key2", "key3"] } },
      {},
      "OK",
      undefined
    );
  });

  it("#ping", function () {
    return testReadCommand("ping", [], {}, {}, {}, "PONG", "PONG");
  });

  it("#psetex", function () {
    return testWriteCommand(
      "psetex",
      ["key", "value", 42000],
      {},
      { _id: "key", body: { value: "value", milliseconds: 42000 } },
      {},
      "OK",
      undefined
    );
  });

  it("#pttl", function () {
    return testReadCommand(
      "pttl",
      ["key"],
      {},
      { _id: "key" },
      {},
      42000,
      42000
    );
  });

  it("#randomkey", function () {
    return testReadCommand("randomkey", [], {}, {}, {}, "key", "key");
  });

  it("#rename", function () {
    return testWriteCommand(
      "rename",
      ["key", "newId"],
      {},
      { _id: "key", body: { newkey: "newId" } },
      {},
      "OK",
      undefined
    );
  });

  it("#renamenx", function () {
    return testWriteCommand(
      "renamenx",
      ["key", "newId"],
      {},
      { _id: "key", body: { newkey: "newId" } },
      {},
      1,
      true
    );
  });

  it("#rpop", function () {
    return testWriteCommand(
      "rpop",
      ["key"],
      {},
      { _id: "key" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#rpoplpush", function () {
    return testWriteCommand(
      "rpoplpush",
      ["src", "dest"],
      {},
      { body: { source: "src", destination: "dest" } },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#rpush", function () {
    return testWriteCommand(
      "rpush",
      ["key", ["foo", "bar", "baz"]],
      {},
      { _id: "key", body: { values: ["foo", "bar", "baz"] } },
      {},
      4,
      4
    );
  });

  it("#rpushx", function () {
    return testWriteCommand(
      "rpushx",
      ["key", "foo"],
      {},
      { _id: "key", body: { value: "foo" } },
      {},
      4,
      4
    );
  });

  it("#sadd", function () {
    return testWriteCommand(
      "sadd",
      ["key", ["foo", "bar", "baz"]],
      {},
      { _id: "key", body: { members: ["foo", "bar", "baz"] } },
      {},
      4,
      4
    );
  });

  it("#scan", function () {
    return testReadCommand(
      "scan",
      [0],
      { count: 42, match: "foo*" },
      { cursor: 0 },
      { count: 42, match: "foo*" },
      [42, ["bar", "baz", "qux"]],
      { cursor: 42, values: ["bar", "baz", "qux"] }
    );
  });

  it("#scard", function () {
    return testReadCommand("scard", ["key"], {}, { _id: "key" }, {}, 3, 3);
  });

  it("#sdiff", function () {
    return testReadCommand(
      "sdiff",
      ["key", ["foo", "bar", "baz"]],
      {},
      { _id: "key", keys: ["foo", "bar", "baz"] },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#sdiffstore", function () {
    return testWriteCommand(
      "sdiffstore",
      ["key", ["foo", "bar", "baz"], "dest"],
      {},
      {
        _id: "key",
        body: { keys: ["foo", "bar", "baz"], destination: "dest" },
      },
      {},
      4,
      4
    );
  });

  it("#set", function () {
    return testWriteCommand(
      "set",
      ["key", "foo"],
      { ex: 0, nx: true, px: 42, xx: true },
      { _id: "key", body: { value: "foo", ex: 0, nx: true, px: 42, xx: true } },
      {},
      "OK",
      undefined
    );
  });

  it("#setex", function () {
    return testWriteCommand(
      "setex",
      ["key", "foo", 42],
      {},
      { _id: "key", body: { value: "foo", seconds: 42 } },
      {},
      "OK",
      undefined
    );
  });

  it("#setnx", function () {
    return testWriteCommand(
      "setnx",
      ["key", "foo"],
      {},
      { _id: "key", body: { value: "foo" } },
      {},
      1,
      true
    );
  });

  it("#sinter", function () {
    return testReadCommand(
      "sinter",
      [["k1", "k2", "k3"]],
      {},
      { keys: ["k1", "k2", "k3"] },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#sinterstore", function () {
    return testWriteCommand(
      "sinterstore",
      ["key", ["k1", "k2", "k3"]],
      {},
      { body: { destination: "key", keys: ["k1", "k2", "k3"] } },
      {},
      1,
      1
    );
  });

  it("#sismember", function () {
    return testReadCommand(
      "sismember",
      ["key", "foobar"],
      {},
      { _id: "key", member: "foobar" },
      {},
      0,
      false
    );
  });

  it("#smembers", function () {
    return testReadCommand(
      "smembers",
      ["key"],
      {},
      { _id: "key" },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#smove", function () {
    return testWriteCommand(
      "smove",
      ["key", "dest", "member"],
      {},
      { _id: "key", body: { destination: "dest", member: "member" } },
      {},
      1,
      true
    );
  });

  it("#sort", function () {
    return testWriteCommand(
      "sort",
      ["key"],
      {
        alpha: true,
        by: "foo",
        direction: "asc",
        get: ["foo", "bar"],
        limit: { count: 0, offset: 1 },
      },
      {
        _id: "key",
        body: {
          alpha: true,
          by: "foo",
          direction: "asc",
          get: ["foo", "bar"],
          limit: { count: 0, offset: 1 },
        },
      },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#spop", function () {
    return testWriteCommand(
      "spop",
      ["key"],
      { count: 2 },
      { _id: "key", body: { count: 2 } },
      {},
      ["foo", "bar"],
      ["foo", "bar"]
    );
  });

  it("#srandmember", function () {
    return testReadCommand(
      "srandmember",
      ["key"],
      { count: 2 },
      { _id: "key" },
      { count: 2 },
      ["foo", "bar"],
      ["foo", "bar"]
    );
  });

  it("#srem", function () {
    return testWriteCommand(
      "srem",
      ["key", ["m1", "m2", "m3"]],
      {},
      { _id: "key", body: { members: ["m1", "m2", "m3"] } },
      {},
      3,
      3
    );
  });

  it("#sscan", function () {
    return testReadCommand(
      "sscan",
      ["key", 0],
      { count: 42, match: "foo*" },
      { _id: "key", cursor: 0 },
      { count: 42, match: "foo*" },
      [42, ["bar", "baz", "qux"]],
      { cursor: 42, values: ["bar", "baz", "qux"] }
    );
  });

  it("#strlen", function () {
    return testReadCommand("strlen", ["key"], {}, { _id: "key" }, {}, 10, 10);
  });

  it("#sunion", function () {
    return testReadCommand(
      "sunion",
      [["k1", "k2", "k3"]],
      {},
      { keys: ["k1", "k2", "k3"] },
      {},
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#sunionstore", function () {
    return testWriteCommand(
      "sunionstore",
      ["key", ["k1", "k2", "k3"]],
      {},
      { body: { destination: "key", keys: ["k1", "k2", "k3"] } },
      {},
      1,
      1
    );
  });

  it("#time", function () {
    return testReadCommand("time", [], {}, {}, {}, [123, 45], [123, 45]);
  });

  it("#touch", function () {
    return testWriteCommand(
      "touch",
      [["k1", "k2", "k3"]],
      {},
      { body: { keys: ["k1", "k2", "k3"] } },
      {},
      3,
      3
    );
  });

  it("#ttl", function () {
    return testReadCommand("ttl", ["key"], {}, { _id: "key" }, {}, 42, 42);
  });

  it("#type", function () {
    return testReadCommand(
      "type",
      ["key"],
      {},
      { _id: "key" },
      {},
      "foobar",
      "foobar"
    );
  });

  it("#zadd", function () {
    var elements = [
      { score: 1, member: "foo" },
      { score: 2, member: "bar" },
      { score: 3, member: "baz" },
    ];

    return testWriteCommand(
      "zadd",
      ["key", elements],
      { ch: true, incr: false, nx: true, xx: true },
      {
        _id: "key",
        body: { ch: true, elements: elements, incr: false, nx: true, xx: true },
      },
      {},
      3,
      3
    );
  });

  it("#zcard", function () {
    return testReadCommand("zcard", ["key"], {}, { _id: "key" }, {}, 3, 3);
  });

  it("#zcount", function () {
    return testReadCommand(
      "zcount",
      ["key", 2, 3],
      {},
      { _id: "key", min: 2, max: 3 },
      {},
      3,
      3
    );
  });

  it("#zincrby", function () {
    return testWriteCommand(
      "zincrby",
      ["key", "foo", 42],
      {},
      { _id: "key", body: { member: "foo", value: 42 } },
      {},
      2,
      2
    );
  });

  it("#zinterstore", function () {
    return testWriteCommand(
      "zinterstore",
      ["key", ["k1", "k2", "k3"]],
      { aggregate: "min", weights: [1, 2, 3] },
      {
        _id: "key",
        body: {
          aggregate: "min",
          keys: ["k1", "k2", "k3"],
          weights: [1, 2, 3],
        },
      },
      {},
      1,
      1
    );
  });

  it("#zlexcount", function () {
    return testReadCommand(
      "zlexcount",
      ["key", "foo", "bar"],
      {},
      { _id: "key", min: "foo", max: "bar" },
      {},
      3,
      3
    );
  });

  it("#zrange", function () {
    return testReadCommand(
      "zrange",
      ["key", 0, -1],
      {},
      { _id: "key", start: 0, stop: -1, options: ["withscores"] },
      {},
      ["foo", 123, "bar", 456],
      [
        { member: "foo", score: 123 },
        { member: "bar", score: 456 },
      ]
    );
  });

  it("#zrangebylex", function () {
    return testReadCommand(
      "zrangebylex",
      ["key", "a", "z"],
      { limit: [0, 1] },
      { _id: "key", min: "a", max: "z" },
      { limit: [0, 1] },
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#zrevrangebylex", function () {
    return testReadCommand(
      "zrevrangebylex",
      ["key", "a", "z"],
      { limit: [0, 1] },
      { _id: "key", min: "a", max: "z" },
      { limit: [0, 1] },
      ["foo", "bar", "baz"],
      ["foo", "bar", "baz"]
    );
  });

  it("#zrangebyscore", function () {
    return testReadCommand(
      "zrangebyscore",
      ["key", 0, 1000],
      { limit: [0, 1] },
      { _id: "key", min: 0, max: 1000, options: ["withscores"] },
      { limit: [0, 1] },
      ["foo", 123, "bar", 456],
      [
        { member: "foo", score: 123 },
        { member: "bar", score: 456 },
      ]
    );
  });

  it("#zrank", function () {
    return testReadCommand(
      "zrank",
      ["key", "foo"],
      {},
      { _id: "key", member: "foo" },
      {},
      3,
      3
    );
  });

  it("#zrem", function () {
    return testWriteCommand(
      "zrem",
      ["key", ["m1", "m2", "m3"]],
      {},
      { _id: "key", body: { members: ["m1", "m2", "m3"] } },
      {},
      3,
      3
    );
  });

  it("#zremrangebylex", function () {
    return testWriteCommand(
      "zremrangebylex",
      ["key", "a", "z"],
      {},
      { _id: "key", body: { min: "a", max: "z" } },
      {},
      3,
      3
    );
  });

  it("#zremrangebyrank", function () {
    return testWriteCommand(
      "zremrangebyrank",
      ["key", 0, 3],
      {},
      { _id: "key", body: { start: 0, stop: 3 } },
      {},
      3,
      3
    );
  });

  it("#zremrangebyscore", function () {
    return testWriteCommand(
      "zremrangebyscore",
      ["key", 0, 3],
      {},
      { _id: "key", body: { min: 0, max: 3 } },
      {},
      3,
      3
    );
  });

  it("#zrevrange", function () {
    return testReadCommand(
      "zrevrange",
      ["key", 0, -1],
      {},
      { _id: "key", start: 0, stop: -1, options: ["withscores"] },
      {},
      ["foo", 123, "bar", 456],
      [
        { member: "foo", score: 123 },
        { member: "bar", score: 456 },
      ]
    );
  });

  it("#zrevrangebyscore", function () {
    return testReadCommand(
      "zrangebyscore",
      ["key", 0, 1000],
      { limit: [0, 1] },
      { _id: "key", min: 0, max: 1000, options: ["withscores"] },
      { limit: [0, 1] },
      ["foo", 123, "bar", 456],
      [
        { member: "foo", score: 123 },
        { member: "bar", score: 456 },
      ]
    );
  });

  it("#zrevrank", function () {
    return testReadCommand(
      "zrevrank",
      ["key", "foo"],
      {},
      { _id: "key", member: "foo" },
      {},
      3,
      3
    );
  });

  it("#zscan", function () {
    return testReadCommand(
      "zscan",
      ["key", 0],
      { count: 42, match: "foo*" },
      { _id: "key", cursor: 0 },
      { count: 42, match: "foo*" },
      [42, ["bar", "baz", "qux"]],
      { cursor: 42, values: ["bar", "baz", "qux"] }
    );
  });

  it("#zscore", function () {
    return testReadCommand(
      "zscore",
      ["key", "foo"],
      {},
      { _id: "key", member: "foo" },
      {},
      "3.14159",
      3.14159
    );
  });

  it("#zunionstore", function () {
    return testWriteCommand(
      "zunionstore",
      ["key", ["k1", "k2", "k3"]],
      { aggregate: "min", weights: [1, 2, 3] },
      {
        _id: "key",
        body: {
          aggregate: "min",
          keys: ["k1", "k2", "k3"],
          weights: [1, 2, 3],
        },
      },
      {},
      1,
      1
    );
  });
});
