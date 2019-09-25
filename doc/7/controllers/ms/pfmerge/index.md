---
code: true
type: page
title: pfmerge
---

# pfmerge

Merges multiple [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) data structures into an unique HyperLogLog structure, approximating the cardinality of the union of the source structures.

[[_Redis documentation_]](https://redis.io/commands/pfmerge)

## Arguments

```js
pfmerge(dest, sources, [options]);
```

<br/>

| Arguments | Type                | Description                       |
| --------- | ------------------- | --------------------------------- |
| `dest`    | <pre>string</pre>   | Destination key                   |
| `sources` | <pre>string[]</pre> | List of HyperLogLog keys to merge |
| `options` | <pre>object</pre>   | Optional query arguments          |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the operation succeeds.

## Usage

<<< ./snippets/pfmerge.js
