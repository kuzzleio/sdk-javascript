---
code: true
type: page
title: zremrangebyrank
---

# zremrangebyrank

Removes members from a sorted set, with their position in the set within a provided index range.

Positions are 0-based, meaning the first member of the set has a position of 0.

[[_Redis documentation_]](https://redis.io/commands/zremrangebyrank)

## Arguments

```js
zremrangebyrank(key, start, stop, [options]);
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

Resolves to the number of removed elements.

## Usage

<<< ./snippets/zremrangebyrank.js
