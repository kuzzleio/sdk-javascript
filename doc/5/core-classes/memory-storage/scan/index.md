---
code: false
type: page
title: scan
description: MemoryStorage:scan
---

# scan

Iterates incrementally over the set of keys in the database using a cursor.

An iteration starts when the cursor is set to `0`.  
To get the next page of results, simply re-send the identical request with the updated cursor position provided in the result set.  
The scan terminates when the next position cursor returned by the server is `0`.

[[_Redis documentation_]](https://redis.io/commands/scan)

---

## scan(cursor, [options], callback)

| Arguments  | Type        | Description                                                                                              |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `cursor`   | int         | Page number (iteration starts with a cursor value of `0`, and ends when the next cursor position is `0`) |
| `options`  | JSON Object | Optional parameters                                                                                      |
| `callback` | function    | Callback                                                                                                 |

---

## Options

| Option     | Type    | Description                                                      | Default |
| ---------- | ------- | ---------------------------------------------------------------- | ------- |
| `count`    | int     | Return the _approximate_ `count` number of items per result page | `10`    |
| `match`    | string  | Search only for field names matching the provided pattern        | `*`     |
| `queuable` | boolean | Make this request queuable or not                                | `true`  |

---

## Callback Response

Returns a JSON object containing 2 entries:

- the cursor position for the next page of results (a next position of `0` indicates the end of the scan)
- a list of fetched keys

## Usage

<<< ./snippets/scan-1.js

> Callback response:

```json
{
  "cursor": 18,
  "values": ["key1", "key2", "..."]
}
```
