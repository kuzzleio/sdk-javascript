---
code: false
type: page
title: zcount
description: MemoryStorage:zcount
---

# zcount

Returns the number of elements held by a sorted set with a score between the provided `min` and `max` values.

By default, the provided min and max values are inclusive. This behavior can be changed using the syntax described in the Redis [ZRANGEBYSCORE](https://redis.io/commands/zrangebyscore) documentation.

[[_Redis documentation_]](https://redis.io/commands/zcount)

---

## zcount(key, min, max, [options], callback)

| Arguments  | Type        | Description                          |
| ---------- | ----------- | ------------------------------------ |
| `key`      | string      | Key identifier                       |
| `min`      | int         | Minimum score (inclusive by default) |
| `max`      | int         | Maximum score (inclusive by default) |
| `options`  | JSON Object | Optional parameters                  |
| `callback` | function    | Callback                             |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the number of elements in the provided score range.

## Usage

<<< ./snippets/zcount-1.js

> Callback response:

```json
2
```
