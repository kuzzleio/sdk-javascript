---
code: false
type: page
title: lpop
description: MemoryStorage:lpop
---

# lpop

Removes and returns the first element of a list.

[[_Redis documentation_]](https://redis.io/commands/lpop)

---

## lpop(key, [options], [callback])

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

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns the value of the removed item.

## Usage

<<< ./snippets/lpop-1.js

> Callback response:

```json
"foo"
```
