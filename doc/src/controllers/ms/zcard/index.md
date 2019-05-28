---
code: true
type: page
title: zcard
---

# zcard

Returns the number of elements held by a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zcard)

## Arguments

```js
zcard(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Sorted set key           |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of elements in the sorted set.

## Usage

<<< ./snippets/zcard.js
