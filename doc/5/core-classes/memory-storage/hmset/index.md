---
code: false
type: page
title: hmset
description: MemoryStorage:hmset
---

# hmset

Sets multiple fields at once in a hash.

[[_Redis documentation_]](https://redis.io/commands/hmset)

---

## hmset(key, entries, [options], [callback])

| Arguments  | Type        | Description                                                                                                                                                              |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`      | string      | Key identifier                                                                                                                                                           |
| `entries`  | array       | List of fields to add, with their value. Each entry is described by a JSON object containing the following properties:<br/>`field` (field name), `value` (field's value) |
| `options`  | JSON Object | Optional parameters                                                                                                                                                      |
| `callback` | function    | Callback                                                                                                                                                                 |

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

<<< ./snippets/hmset-1.js
