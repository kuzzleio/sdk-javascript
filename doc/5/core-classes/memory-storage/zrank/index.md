---
code: false
type: page
title: zrank
description: MemoryStorage:zrank
---

# zrank

Returns the position of an element in a sorted set, with scores in ascending order. The index returned is 0-based (the lowest score member has an index of 0).

[[_Redis documentation_]](https://redis.io/commands/zrank)

---

## zrank(key, member, [options], callback)

| Arguments  | Type        | Description              |
| ---------- | ----------- | ------------------------ |
| `key`      | string      | Key identifier           |
| `member`   | string      | Member of the sorted set |
| `options`  | JSON Object | Optional parameters      |
| `callback` | function    | Callback                 |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the member's position in the sorted set.

## Usage

<<< ./snippets/zrank-1.js

> Callback response:

```json
0
```
