---
code: true
type: page
title: zrevrangebyscore
---

# zrevrangebyscore

Identical to [zrangebyscore](/core/1/api/controllers/memory-storage/zrangebyscore/), except that the sorted set is traversed in descending order.

[[_Redis documentation_]](https://redis.io/commands/zrevrangebyscore)

## Arguments

```js
zrevrangebyscore(key, min, max, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `min`     | <pre>string</pre> | Minimum score value      |
| `max`     | <pre>string</pre> | Maximum score value      |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                                                                                                       |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`    | <pre>integer[2]</pre>     | An array of 2 integers, used to limit the number of returned matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset>,<count>]` |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again                                                                                      |

## Resolve

Resolves to the list of elements in the provided score range, in descending order.

## Usage

<<< ./snippets/zrevrangebyscore.js
