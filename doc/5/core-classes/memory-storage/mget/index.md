---
code: false
type: page
title: mget
description: MemoryStorage:mget
---

# mget

Returns the values of the provided keys.

[[_Redis documentation_]](https://redis.io/commands/mget)

---

## mget(keys, [options], callback)

| Arguments  | Type        | Description              |
| ---------- | ----------- | ------------------------ |
| `keys`     | string      | List of keys to retrieve |
| `options`  | JSON Object | Optional parameters      |
| `callback` | function    | Callback                 |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of the specified keys' values.

## Usage

<<< ./snippets/mget-1.js

> Callback response:

```json
["key1's value", "key2's value", "..."]
```
