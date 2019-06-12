---
code: false
type: page
title: bitcount
description: MemoryStorage:bitcount
---

# bitcount

Counts the number of set bits (population counting) in a string.

[[_Redis documentation_]](https://redis.io/commands/bitcount)

---

## bitcount(key, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `end`      | int     | Ending offset                     | `-1`    |
| `queuable` | boolean | Make this request queuable or not | `true`  |
| `start`    | int     | Starting offset                   | `0`     |

---

## Callback Response

Return an integer containing the count of set bits.

## Usage

<<< ./snippets/bitcount-1.js

> Callback response:

```json
21
```
