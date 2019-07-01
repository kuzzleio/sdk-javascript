---
code: true
type: page
title: setex
---

# setex

Sets a value and a time to live (in seconds) on a key. If the key already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/setex)

## Arguments

```js
setex(key, value, seconds, [options]);
```

<br/>

| Arguments | Type               | Description                                      |
| --------- | ------------------ | ------------------------------------------------ |
| `key`     | <pre>string</pre>  | Key                                              |
| `value`   | <pre>string</pre>  | Value                                            |
| `seconds` | <pre>integer</pre> | Number of seconds after which the key is deleted |
| `options` | <pre>object</pre>  | Optional query arguments                         |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the operation succeeds.

## Usage

<<< ./snippets/setex.js
