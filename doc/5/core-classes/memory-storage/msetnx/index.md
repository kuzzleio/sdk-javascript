---
code: false
type: page
title: msetnx
description: MemoryStorage:msetnx
---

# msetnx

Sets the provided keys to their respective values, only if they do not exist. If a key exists, then the whole operation is aborted and no key is set.

[[_Redis documentation_]](https://redis.io/commands/msetnx)

---

## msetnx(entries, [options], [callback])

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

Returns a boolean specifying if the operation was successful or not.

## Usage

<<< ./snippets/msetnx-1.js

> Callback response:

```json
true
```
