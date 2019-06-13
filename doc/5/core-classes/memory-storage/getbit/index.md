---
code: false
type: page
title: getbit
description: MemoryStorage:getbit
---

# getbit

Returns the bit value at `offset`, in the string value stored in a key.

[[_Redis documentation_]](https://redis.io/commands/getbit)

---

## getbit(key, offset, [options], callback)

| Arguments  | Type        | Description                        |
| ---------- | ----------- | ---------------------------------- |
| `key`      | string      | Key identifier                     |
| `offset`   | int         | Offset position in the key's value |
| `options`  | JSON Object | Optional parameters                |
| `callback` | function    | Callback                           |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns the bit value at the provided offset.

## Usage

<<< ./snippets/getbit-1.js

> Callback response:

```json
1
```
