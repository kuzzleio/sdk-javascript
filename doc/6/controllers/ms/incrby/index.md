---
code: true
type: page
title: incrby
---

# incrby

Increments the number stored at `key` by the provided integer value. If the key does not exist, it is set to 0 before performing the operation.

[[_Redis documentation_]](https://redis.io/commands/incrby)

## Arguments

```js
incrby(key, increment, [options]);
```

<br/>

| Arguments   | Type               | Description              |
| ----------- | ------------------ | ------------------------ |
| `key`       | <pre>string</pre>  | Key                      |
| `increment` | <pre>integer</pre> | Increment value          |
| `options`   | <pre>object</pre>  | Optional query arguments |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to the incremented key value.

## Usage

<<< ./snippets/incrby.js
