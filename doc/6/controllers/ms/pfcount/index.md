---
code: true
type: page
title: pfcount
---

# pfcount

Returns the probabilistic cardinality of a [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) data structure, or of the merged HyperLogLog structures if more than 1 is provided (see [pfadd](/sdk/js/6/controllers/ms/pfadd)).

[[_Redis documentation_]](https://redis.io/commands/pfcount)

## Arguments

```js
pfcount(keys, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `keys`    | <pre>string[]</pre> | List of HyperLogLog keys |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the merged HyperLogLog structures cardinality.

## Usage

<<< ./snippets/pfcount.js
