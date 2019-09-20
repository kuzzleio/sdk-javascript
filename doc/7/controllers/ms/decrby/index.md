---
code: true
type: page
title: decrby
---

# decrby

Decrements the number stored at `key` by a provided integer value. If the key does not exist, it is set to 0 before performing the operation.

[[_Redis documentation_]](https://redis.io/commands/decrby)

## Arguments

```js
decrby(key, decrement, [options]);
```

<br/>

| Arguments   | Type               | Description              |
| ----------- | ------------------ | ------------------------ |
| `key`       | <pre>string</pre>  | Key                      |
| `decrement` | <pre>integer</pre> | Decrement value          |
| `options`   | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the updated key value.

## Usage

<<< ./snippets/decrby.js
