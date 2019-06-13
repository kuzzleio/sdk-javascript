---
code: false
type: page
title: zrevrangebyscore
description: MemoryStorage:zrevrangebyscore
---

# zrevrangebyscore

Identical to [zrangebyscore](/sdk/js/5/core-classes/memory-storage/zrangebyscore) except that the sorted set is traversed in descending order.

[[_Redis documentation_]](https://redis.io/commands/zrevrangebyscore)

---

## zrevrangebyscore(key, min, max, [options], [callback])

| Arguments  | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `key`      | string      | Key identifier                             |
| `min`      | double      | Minimum score value (inclusive by default) |
| `max`      | double      | Maximum score value (inclusive by default) |
| `options`  | JSON Object | Optional parameters                        |
| `callback` | function    | Callback                                   |

---

## Options

| Option     | Type    | Description                                                                                                                                        | Default |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `limit`    | array   | Limit the result set to a range of matching elements (similar to _SELECT LIMIT offset, count_ in SQL).<br/>Format: `[<offset(int)>, <count(int)>]` | `null`  |
| `queuable` | boolean | Make this request queuable or not                                                                                                                  | `true`  |

---

## Return value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns an array of matching members.

## Usage

<<< ./snippets/zrevrangebyscore-1.js

> Callback response:

```json
[
  { "member": "baz", "score": 3 },
  { "member": "bar", "score": 2 },
  { "member": "foo", "score": 1 }
]
```
