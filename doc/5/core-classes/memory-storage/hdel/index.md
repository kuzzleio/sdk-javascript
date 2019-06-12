---
code: false
type: page
title: hdel
description: MemoryStorage:hdel
---

# hdel

Removes fields from a hash.

[[_Redis documentation_]](https://redis.io/commands/hdel)

---

## hdel(key, fields, [options], [callback])

| Arguments  | Type        | Description                   |
| ---------- | ----------- | ----------------------------- |
| `key`      | string      | Key identifier                |
| `fields`   | array       | List of field names to delete |
| `options`  | JSON Object | Optional parameters           |
| `callback` | function    | Callback                      |

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

Returns the number of removed fields.

## Usage

<<< ./snippets/hdel-1.js

> Callback response:

```json
2
```
