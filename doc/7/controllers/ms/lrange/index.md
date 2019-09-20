---
code: true
type: page
title: lrange
---

# lrange

Returns the list elements between the `start` and `stop` positions.

Offsets start at `0`, and the range is inclusive.

[[_Redis documentation_]](https://redis.io/commands/lrange)

## Arguments

```js
lrange(key, start, stop, [options]);
```

<br/>

| Arguments | Type               | Description                |
| --------- | ------------------ | -------------------------- |
| `key`     | <pre>string</pre>  | List key                   |
| `start`   | <pre>integer</pre> | Starting index (inclusive) |
| `stop`    | <pre>integer</pre> | Ending index (inclusive)   |
| `options` | <pre>object</pre>  | Optional query arguments   |

The `start` and `stop` arguments can be negative. In that case, the offset is calculated from the end of the list, going backward. For instance, -3 is the third element from the end of the list.

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an array of list elements.

## Usage

<<< ./snippets/lrange.js
