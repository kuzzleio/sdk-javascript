---
code: true
type: page
title: zrange
---

# zrange

Returns elements depending on their position in the sorted set.

[[_Redis documentation_]](https://redis.io/commands/zrange)

## Arguments

```js
zrange(key, start, stop, [options]);
```

<br/>

| Arguments | Type               | Description                       |
| --------- | ------------------ | --------------------------------- |
| `key`     | <pre>string</pre>  | Sorted set key                    |
| `start`   | <pre>integer</pre> | Starting index offset (inclusive) |
| `stop`    | <pre>integer</pre> | Ending index offset (inclusive)   |
| `options` | <pre>object</pre>  | Optional query arguments          |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a list of element objects.

## Usage

<<< ./snippets/zrange.js
