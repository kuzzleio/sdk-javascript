---
code: true
type: page
title: expireat
---

# expireat

Sets an expiration timestamp on a key. After the timestamp has been reached, the key will automatically be deleted.

[[_Redis documentation_]](https://redis.io/commands/expireat)

## Arguments

```js
expireat(key, timestamp, [options]);
```

<br/>

| Arguments   | Type               | Description                                                                    |
| ----------- | ------------------ | ------------------------------------------------------------------------------ |
| `key`       | <pre>string</pre>  | Key                                                                            |
| `timestamp` | <pre>integer</pre> | Expiration timestamp ([Epoch](https://en.wikipedia.org/wiki/Unix_time) format) |
| `options`   | <pre>object</pre>  | Optional query arguments                                                       |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a boolean telling whether the operation was successful or not.

## Usage

<<< ./snippets/expireat.js
