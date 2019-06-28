---
code: false
type: page
title: hkeys
description: MemoryStorage:hkeys
---

# hkeys

Returns all field names contained in a hash.

[[_Redis documentation_]](https://redis.io/commands/hkeys)

---

## hkeys(key, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of field names.

## Usage

<<< ./snippets/hkeys-1.js

> Callback response:

```json
["field1", "field2", "..."]
```
