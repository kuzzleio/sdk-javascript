---
code: false
type: page
title: lpushx
description: MemoryStorage:lpushx
---

# lpushx

Prepends the specified value to a list, only if the key already exists and if it holds a list.

[[_Redis documentation_]](https://redis.io/commands/lpushx)

---

## lpushx(key, value, [options], [callback])

| Arguments  | Type        | Description                               |
| ---------- | ----------- | ----------------------------------------- |
| `key`      | string      | Key identifier                            |
| `value`    | array       | Value to add at the beginning of the list |
| `options`  | JSON Object | Optional parameters                       |
| `callback` | function    | Callback                                  |

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

Returns an integer containing the updated number of items in the list.

## Usage

<<< ./snippets/lpushx-1.js

> Callback response:

```json
4
```
