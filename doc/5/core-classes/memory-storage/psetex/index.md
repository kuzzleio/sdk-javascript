---
code: false
type: page
title: psetex
description: MemoryStorage:psetex
---

# psetex

Sets a key with the provided value, and an expiration delay expressed in milliseconds. If the key does not exist, it is created beforehand.

[[_Redis documentation_]](https://redis.io/commands/psetex)

---

## psetex(key, value, ttl, [options], [callback])

| Arguments  | Type        | Description                              |
| ---------- | ----------- | ---------------------------------------- |
| `key`      | string      | Key identifier                           |
| `value`    | string      | Value to set                             |
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

Returns null if successful.

## Usage

<<< ./snippets/psetex-1.js
