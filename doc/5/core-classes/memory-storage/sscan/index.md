---
code: false
type: page
title: sscan
description: MemoryStorage:sscan
---

# sscan

Identical to [scan](/sdk/js/5/core-classes/memory-storage/scan), except that `sscan` iterates the members held by a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/sscan)

---

## sscan(key, cursor, [options], callback)

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
- an array of members

## Usage

<<< ./snippets/sscan-1.js

> Callback response:

```json
{
  "cursor": 18,
  "values": ["member1", "member2", "..."]
}
```
