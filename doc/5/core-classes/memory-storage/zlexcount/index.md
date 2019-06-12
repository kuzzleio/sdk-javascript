---
code: false
type: page
title: zlexcount
description: MemoryStorage:zlexcount
---

# zlexcount

Counts elements in a sorted set where all members have equal score, using lexicographical ordering. The `min` and `max` values are inclusive by default. To change this behavior, please check the syntax detailed in the [Redis documentation](https://redis.io/commands/zrangebylex).

[[_Redis documentation_]](https://redis.io/commands/zlexcount)

---

## zlexcount(key, min, max, [options], callback)

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

## Callback Response

Returns an integer containing the number of elements in the provided lexicographical value range.

## Usage

<<< ./snippets/zlexcount-1.js

> Callback response:

```json
2
```
