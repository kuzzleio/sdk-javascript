---
code: true
type: page
title: getbit
---

# getbit

Returns the bit value at the provided offset, in the string value stored in a key.

[[_Redis documentation_]](https://redis.io/commands/getbit)

## Arguments

```js
getbit(key, offset, options])

```

<br/>

| Arguments | Type               | Description              |
| --------- | ------------------ | ------------------------ |
| `key`     | <pre>string</pre>  | Key                      |
| `offset`  | <pre>integer</pre> | Bit offset               |
| `options` | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the bit at the provided offset (`0` or `1`).

## Usage

<<< ./snippets/getbit.js
