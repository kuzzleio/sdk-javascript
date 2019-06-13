---
code: false
type: page
title: lset
description: MemoryStorage:lset
---

# lset

Sets the list element at `index` with the provided value.

[[_Redis documentation_]](https://redis.io/commands/lset)

---

## lset(key, index, value, [options], [callback])

| Arguments  | Type        | Description                          |
| ---------- | ----------- | ------------------------------------ |
| `key`      | string      | Key identifier                       |
| `index`    | int         | Position of the list to update       |
| `value`    | string      | New value at the provided list index |
| `options`  | JSON Object | Optional parameters                  |
| `callback` | function    | Callback                             |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns null if successful.

## Usage

<<< ./snippets/lset-1.js
