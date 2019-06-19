---
code: false
type: page
title: pexpire
description: MemoryStorage:pexpire
---

# pexpire

Sets a timeout (in milliseconds) on a key. After the timeout has expired, the key will automatically be deleted.

[[_Redis documentation_]](https://redis.io/commands/pexpire)

---

## pexpire(key, ttl, [options], [callback])

| Arguments  | Type        | Description                              |
| ---------- | ----------- | ---------------------------------------- |
| `key`      | string      | Key identifier                           |
| `ttl`      | int         | Time to live of the key, in milliseconds |
| `options`  | JSON Object | Optional parameters                      |
| `callback` | function    | Callback                                 |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns a boolean specifying if the operation was successful or not.

## Usage

<<< ./snippets/pexpire-1.js

> Callback response:

```json
true
```
