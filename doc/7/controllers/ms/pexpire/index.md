---
code: true
type: page
title: pexpire
---

# pexpire

Sets a timeout (in milliseconds) on a key. After the timeout has expired, the key will automatically be deleted.

[[_Redis documentation_]](https://redis.io/commands/pexpire)

## Arguments

```js
pexpire(key, milliseconds, [options]);
```

<br/>

| Arguments      | Type               | Description                                           |
| -------------- | ------------------ | ----------------------------------------------------- |
| `key`          | <pre>string</pre>  | Key                                                   |
| `milliseconds` | <pre>integer</pre> | Number of milliseconds after which the key is deleted |
| `options`      | <pre>object</pre>  | Optional query arguments                              |

### options

The `options` arguments can contain the following option properties:

| Property   | Type (default)            | Description                                                                  |
| ---------- | ------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean (true)</pre> | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a boolean, telling whether the operation succeeded or not.

## Usage

<<< ./snippets/pexpire.js
