---
code: true
type: page
title: bitcount
---

# bitcount

Counts the number of set bits (population counting) in a string.

[[_Redis documentation_]](https://redis.io/commands/bitcount)

## Arguments

```js
bitcount(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Key                      |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `end`      | <pre>integer</pre>        | Count ends at the provided offset                                            |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |
| `start`    | <pre>integer</pre>        | Count starts at the provided offset                                          |

## Resolve

Resolves to the number of set bits.

## Usage

<<< ./snippets/bitcount.js
