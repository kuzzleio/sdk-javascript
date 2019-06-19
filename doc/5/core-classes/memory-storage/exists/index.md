---
code: false
type: page
title: exists
description: MemoryStorage:exists
---

# exists

Checks if the specified keys exist in the database.

[[_Redis documentation_]](https://redis.io/commands/exists)

---

## exists(keys, [options], callback)

| Arguments  | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `keys`     | array       | List of keys to check for existence |
| `options`  | JSON Object | Optional parameters                 |
| `callback` | function    | Callback                            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the number of existing keys amongst the provided list.

## Usage

<<< ./snippets/exists-1.js

> Callback response:

```json
2
```
