---
code: true
type: page
title: zcount
---

# zcount

Returns the number of elements held by a sorted set with a score within the provided range.

[[_Redis documentation_]](https://redis.io/commands/zcount)

## Arguments

```js
zcount(key, min, max, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `min`     | <pre>string</pre> | Minimum range value      |
| `max`     | <pre>string</pre> | Maximum range value      |
| `options` | <pre>object</pre> | Optional query arguments |

By default, the provided min and max values are inclusive. This behavior can be changed using the syntax described in the Redis [ZRANGEBYSCORE](https://redis.io/commands/zrangebyscore#exclusive-intervals-and-infinity) documentation.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

## Usage

<<< ./snippets/zcount.js
