---
code: false
type: page
title: decrby
description: MemoryStorage:decrby
---

# decrby

Decrements the number stored at `key` by a provided integer value. If the key does not exist, it is set to 0 before performing the operation.

[[_Redis documentation_]](https://redis.io/commands/decrby)

---

## decrby(key, value, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `value`    | int         | Decrement value     |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

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

Returns an integer containing the updated key value.

## Usage

<<< ./snippets/decrby-1.js

> Callback response:

```json
57
```
