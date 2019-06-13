---
code: false
type: page
title: zremrangebyrank
description: MemoryStorage:zremrangebyrank
---

# zremrangebyrank

Removes members from a sorted set with their position in the set between `start` and `stop` (inclusive).

Positions are 0-based, meaning the first member of the set has a position of 0.

[[_Redis documentation_]](https://redis.io/commands/zremrangebyrank)

---

## zremrangebyrank(key, min, max, [options], [callback])

| Arguments  | Type        | Description                                   |
| ---------- | ----------- | --------------------------------------------- |
| `key`      | string      | Key identifier                                |
| `min`      | int         | Minimum position index (inclusive by default) |
| `max`      | int         | Maximum position index (inclusive by default) |
| `options`  | JSON Object | Optional parameters                           |
| `callback` | function    | Callback                                      |

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

Returns an integer containing the number of removed members from the sorted set.

## Usage

<<< ./snippets/zremrangebyrank-1.js

> Callback response:

```json
2
```
