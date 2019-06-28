---
code: true
type: page
title: sunionstore
---

# sunionstore

Computes the union of multiple sets of unique values and stores it in a new set.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sunionstore)

## Arguments

```js
sunionstore(dest, sources, [options]);
```

<br/>

| Arguments | Type                | Description              |
| --------- | ------------------- | ------------------------ |
| `key`     | <pre>string</pre>   | Union target key         |
| `sources` | <pre>string[]</pre> | List of set keys         |
| `options` | <pre>object</pre>   | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of values added to the destination key.

## Usage

<<< ./snippets/sunionstore.js
