---
code: true
type: page
title: ltrim
---

# ltrim

Trims an existing list so that it will contain only the specified range of elements specified.

[[_Redis documentation_]](https://redis.io/commands/ltrim)

## Arguments

```js
ltrim(key, start, stop, [options]);
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

Resolves once the operation is finished.

## Usage

<<< ./snippets/ltrim.js
