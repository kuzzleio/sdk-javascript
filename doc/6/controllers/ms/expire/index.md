---
code: true
type: page
title: expire
---

# expire

Sets a timeout (in seconds) on a key. After the timeout has expired, the key is automatically deleted.

[[_Redis documentation_]](https://redis.io/commands/expire)

## Arguments

```js
expire(key, seconds, [options]);
```

<br/>

| Arguments | Type               | Description                              |
| --------- | ------------------ | ---------------------------------------- |
| `key`     | <pre>string</pre>  | Key                                      |
| `seconds` | <pre>integer</pre> | Number of seconds before the key expires |
| `options` | <pre>object</pre>  | Optional query arguments                 |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a boolean telling whether the operation was successful or not.

## Usage

<<< ./snippets/expire.js
