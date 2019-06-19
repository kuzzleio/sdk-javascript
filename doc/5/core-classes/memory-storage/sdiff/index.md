---
code: false
type: page
title: sdiff
description: MemoryStorage:sdiff
---

# sdiff

Returns the difference between the set of unique values stored at `key` and the other provided sets.

[[_Redis documentation_]](https://redis.io/commands/sdiff)

---

## sdiff(key, keys, [options], [callback])

| Arguments  | Type        | Description                                              |
| ---------- | ----------- | -------------------------------------------------------- |
| `key`      | string      | Key identifier to compare                                |
| `keys`     | array       | list of set keys to compare with the set stored at `key` |
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

Returns an array of differences.

## Usage

<<< ./snippets/sdiff-1.js

> Callback response:

```json
["diff value1", "diff value2", "..."]
```
