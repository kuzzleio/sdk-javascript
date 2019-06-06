---
code: true
type: page
title: sinterstore
---

# sinterstore

Computes the intersection of the provided sets of unique values, and stores the result in a destination key.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sinterstore)

## Arguments

```js
sinterstore(dest, keys, [options]);
```

<br/>

| Arguments | Type                | Description                   |
| --------- | ------------------- | ----------------------------- |
| `dest`    | <pre>string</pre>   | Destination key               |
| `keys`    | <pre>string[]</pre> | List of set keys to intersect |
| `options` | <pre>object</pre>   | Optional query arguments      |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of stored values.

## Usage

<<< ./snippets/sinterstore.js
