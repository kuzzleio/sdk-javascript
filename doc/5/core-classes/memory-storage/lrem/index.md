---
code: false
type: page
title: lrem
description: MemoryStorage:lrem
---

# lrem

Removes the first `count` occurences of elements equal to `value` from a list.

[[_Redis documentation_]](https://redis.io/commands/lrem)

---

## lrem(key, count, value, [options], [callback])

| Arguments  | Type        | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| `key`      | string      | Key identifier                              |
| `count`    | int         | Number of occurences of the value to remove |
| `value`    | string      | Value to be removed from the list           |
| `options`  | JSON Object | Optional parameters                         |
| `callback` | function    | Callback                                    |

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

Returns an integer containing the number of removed elements.

## Usage

<<< ./snippets/lrem-1.js

> Callback response:

```json
1
```
