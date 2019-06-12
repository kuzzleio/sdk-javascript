---
code: false
type: page
title: touch
description: MemoryStorage:touch
---

# touch

Alters the last access time of one or multiple keys. A key is ignored if it does not exist.

[[_Redis documentation_]](https://redis.io/commands/touch)

---

## touch(keys, [options], [callback])

| Arguments  | Type        | Description           |
| ---------- | ----------- | --------------------- |
| `keys`     | array       | List of keys to alter |
| `options`  | JSON Object | Optional parameters   |
| `callback` | function    | Callback              |

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

Returns an integer containing the number of altered keys.

## Usage

<<< ./snippets/touch-1.js

> Callback response:

```json
3
```
