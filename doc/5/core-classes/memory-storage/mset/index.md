---
code: false
type: page
title: mset
description: MemoryStorage:mset
---

# mset

Sets the provided keys to their respective values. If a key does not exist, it is created. Otherwise, the key’s value is overwritten.

[[_Redis documentation_]](https://redis.io/commands/mset)

---

## mset(entries, [options], [callback])

| Arguments  | Type        | Description                                                                                                                                             |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entries`  | array       | List of objects each containing the key identifier to add with its associated value.<br/>Properties: `key` (key identifier), `value` (associated value) |
| `options`  | JSON Object | Optional parameters                                                                                                                                     |
| `callback` | function    | Callback                                                                                                                                                |

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

<<< ./snippets/mset-1.js
