---
code: true
type: page
title: zremrangebyscore
---

# zremrangebyscore

Removes members from a sorted set, with a score between the provided interval.

[[_Redis documentation_]](https://redis.io/commands/zremrangebylex)

## Arguments

```js
zremrangebyscore(key, min, max, [options]);
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

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of removed elements.

## Usage

<<< ./snippets/zremrangebyscore.js
