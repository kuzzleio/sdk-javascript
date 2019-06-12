---
code: false
type: page
title: renamenx
description: MemoryStorage:renamenx
---

# renamenx

Renames a key to `newkey`, only if `newkey` does not already exist.

[[_Redis documentation_]](https://redis.io/commands/renamenx)

---

## renamenx(key, newkey, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `newkey`   | string      | New key identifier  |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

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

<<< ./snippets/renamenx-1.js

> Callback response:

```json
true
```
