---
code: true
type: page
title: zrangebyscore
---

# zrangebyscore

Returns all sorted set elements with a score within a provided range.

The elements are considered to be ordered from low to high scores.

[[_Redis documentation_]](https://redis.io/commands/zrangebyscore)

## Arguments

```js
zrangebyscore(key, min, max, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `min`     | <pre>string</pre> | Minimum score value      |
| `max`     | <pre>string</pre> | Maximum score value      |
| `options` | <pre>object</pre> | Optional query arguments |

By default, `min` and `max` are inclusive. Check the full Redis documentation for other options.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                                                                                                       |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`    | <pre>integer[2]</pre>     | An array of 2 integers, used to limit the number of returned matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset>,<count>]` |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again                                                                                      |

## Resolve

Resolves to the list of elements in the provided score range.

## Usage

<<< ./snippets/zrangebyscore.js
