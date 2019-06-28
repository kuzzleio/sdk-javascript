---
code: false
type: page
title: scard
description: MemoryStorage:scard
---

# scard

Returns the number of members stored in a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/scard)

---

## scard(key, [options], callback)

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

Returns an integer containing the number of items in the set.

## Usage

<<< ./snippets/scard-1.js

> Callback response:

```json
3
```
