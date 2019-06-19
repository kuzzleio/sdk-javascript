---
code: false
type: page
title: zrangebyscore
description: MemoryStorage:zrangebyscore
---

# zrangebyscore

Returns all the elements in the sorted set at key with a score between `min` and `max` (inclusive). The elements are considered to be ordered from low to high scores.

[[_Redis documentation_]](https://redis.io/commands/zrangebyscore)

---

## zrangebyscore(key, min, max, [options], [callback])

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

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns an array of matching members.

## Usage

<<< ./snippets/zrangebyscore-1.js

> Callback response:

```json
[
  { "member": "foo", "score": 1 },
  { "member": "bar", "score": 2 },
  { "member": "baz", "score": 3 }
]
```
