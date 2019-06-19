---
code: false
type: page
title: rename
description: MemoryStorage:rename
---

# rename

Renames a key to `newkey`. If `newkey` already exists, it is overwritten.

[[_Redis documentation_]](https://redis.io/commands/rename)

---

## rename(key, newkey, [options], [callback])

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

## Return value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns null if successful.

## Usage

<<< ./snippets/rename-1.js
