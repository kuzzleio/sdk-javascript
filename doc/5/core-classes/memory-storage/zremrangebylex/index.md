---
code: false
type: page
title: zremrangebylex
description: MemoryStorage:zremrangebylex
---

# zremrangebylex

Removes members from a sorted set where all elements have the same score, using lexicographical ordering. The `min` and `max` interval are inclusive, see the [Redis documentation](https://redis.io/commands/zrangebylex) to change this behavior.

[[_Redis documentation_]](https://redis.io/commands/zremrangebylex)

---

## zremrangebylex(key, min, max, [options], [callback])

| Arguments  | Type        | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| `key`      | string      | Key identifier                              |
| `min`      | string      | Minimum member value (inclusive by default) |
| `max`      | string      | Maximum member value (inclusive by default) |
| `options`  | JSON Object | Optional parameters                         |
| `callback` | function    | Callback                                    |

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

Returns an integer containing the number of removed members from the sorted set.

## Usage

<<< ./snippets/zremrangebylex-1.js

> Callback response:

```json
2
```
