---
code: true
type: page
title: scard
---

# scard

Returns the number of members stored in a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/scard)

## Arguments

```js
scard(key, [options]);
```

<br/>

| Arguments | Type              | Description              |
| --------- | ----------------- | ------------------------ |
| `key`     | <pre>string</pre> | Set key                  |
| `options` | <pre>object</pre> | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the set length.

## Usage

<<< ./snippets/scard.js
