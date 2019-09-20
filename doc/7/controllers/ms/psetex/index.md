---
code: true
type: page
title: psetex
---

# psetex

Sets a key with the provided value, and an expiration delay expressed in milliseconds. If the key does not exist, it is created beforehand.

[[_Redis documentation_]](https://redis.io/commands/psetex)

## Arguments

```js
psetex(key, value, milliseconds, [options]);
```

<br/>

| Arguments      | Type               | Description                                           |
| -------------- | ------------------ | ----------------------------------------------------- |
| `key`          | <pre>string</pre>  | Key                                                   |
| `value`        | <pre>string</pre>  | Value                                                 |
| `milliseconds` | <pre>integer</pre> | Number of milliseconds after which the key is deleted |
| `options`      | <pre>object</pre>  | Optional query arguments                              |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves once the operation succeeds.

## Usage

<<< ./snippets/psetex.js
