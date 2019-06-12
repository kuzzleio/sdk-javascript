---
code: false
type: page
title: zremrangebyscore
description: MemoryStorage:zremrangebyscore
---

# zremrangebyscore

Removes members from a sorted set with a score between `min` and `max` (inclusive by default).

[[_Redis documentation_]](https://redis.io/commands/zremrangebyscore)

---

## zremrangebyscore(key, min, max, [options], [callback])

| Arguments  | Type        | Description                          |
| ---------- | ----------- | ------------------------------------ |
| `key`      | string      | Key identifier                       |
| `min`      | double      | Minimum score (inclusive by default) |
| `max`      | double      | Maximum score (inclusive by default) |
| `options`  | JSON Object | Optional parameters                  |
| `callback` | function    | Callback                             |

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

<<< ./snippets/zremrangebyscore-1.js

> Callback response:

```json
2
```
