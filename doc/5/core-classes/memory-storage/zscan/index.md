---
code: false
type: page
title: zscan
description: MemoryStorage:zscan
---

# zscan

Identical to [scan](/sdk/js/5/core-classes/memory-storage/scan), except that `zscan` iterates the members held by a sorted set.

[[_Redis documentation_]](https://redis.io/commands/zscan)

---

## zscan(key, cursor, [options], callback)

| Arguments  | Type        | Description                                                                                              |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `key`      | string      | Key identifier                                                                                           |
| `cursor`   | int         | Page number (iteration starts with a cursor value of `0`, and ends when the next cursor position is `0`) |
| `options`  | JSON Object | Optional parameters                                                                                      |
| `callback` | function    | Callback                                                                                                 |

---

## Options

| Option     | Type    | Description                                                      | Default |
| ---------- | ------- | ---------------------------------------------------------------- | ------- |
| `count`    | int     | Return the _approximate_ `count` number of items per result page | `10`    |
| `match`    | string  | Search only for member values matching the provided pattern      | `*`     |
| `queuable` | boolean | Make this request queuable or not                                | `true`  |

---

## Callback Response

Returns a JSON array containing 2 entries:

- the cursor position for the next page of results (a next position of `0` indicates the end of the scan)
- an array of sorted set members and their associated scores

## Usage

<<< ./snippets/zscan-1.js

> Callback response:

```json
{
  "cursor": 18,
  "values": ["member1", "member1's score", "member2", "member2's score", "..."]
}
```
