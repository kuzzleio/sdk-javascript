---
code: true
type: page
title: sdiffstore
---

# sdiffstore

Computes the difference between a reference set of unique values, and other sets. The differences are then stored in the provided destination key.

If the destination key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/sdiffstore)

## Arguments

```js
sdiffstore(ref, sets, dest, [options]);
```

<br/>

| Arguments | Type                | Description                              |
| --------- | ------------------- | ---------------------------------------- |
| `ref`     | <pre>string</pre>   | Set key of reference                     |
| `sets`    | <pre>string[]</pre> | List of sets to compare to the reference |
| `dest`    | <pre>string</pre>   | Destination key                          |
| `options` | <pre>object</pre>   | Optional query arguments                 |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the number of values stored at the new key.

## Usage

<<< ./snippets/sdiffstore.js
