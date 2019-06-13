---
code: false
type: page
title: zrem
description: MemoryStorage:zrem
---

# zrem

Removes members from a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zrem)

---

## zrem(key, members, [options], [callback])

| Arguments  | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| `key`      | string      | Key identifier            |
| `members`  | array       | List of members to remove |
| `options`  | JSON Object | Optional parameters       |
| `callback` | function    | Callback                  |

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

Returns an integer containing the number of members removed from the sorted set.

## Usage

<<< ./snippets/zrem-1.js

> Callback response:

```json
3
```
