---
code: false
type: page
title: zcard
description: MemoryStorage:zcard
---

# zcard

Returns the number of elements held by a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zcard)

---

## zcard(key, [options], callback)

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

## Callback Response

Returns an integer containing the number of elements in a sorted set.

## Usage

<<< ./snippets/zcard-1.js

> Callback response:

```json
4
```
