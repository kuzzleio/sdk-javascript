---
code: false
type: page
title: zrange
description: MemoryStorage:zrange
---

# zrange

Returns elements from a sorted set depending on their position in the set, from a `start` position index to a `stop` position index (inclusives).  
First position starts at `0`.

[[_Redis documentation_]](https://redis.io/commands/zrange)

---

## zrange(key, start, stop, [options], [callback])

| Arguments  | Type        | Description                                              |
| ---------- | ----------- | -------------------------------------------------------- |
| `key`      | string      | Key identifier                                           |
| `start`    | int         | Start position in the set (index starts at position `0`) |
| `stop`     | int         | End position in the set                                  |
| `options`  | JSON Object | Optional parameters                                      |
| `callback` | function    | Callback                                                 |

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

Returns an array of objects, each containing the following properties:

- `member`: member value in the sorted set
- `score`: member associated score

## Usage

<<< ./snippets/zrange-1.js

> Callback response:

```json
[
  { "member": "foo", "score": 1 },
  { "member": "bar", "score": 2 },
  { "member": "baz", "score": 3 }
]
```
