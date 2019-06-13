---
code: false
type: page
title: incrbyfloat
description: MemoryStorage:incrbyfloat
---

# incrbyfloat

Increments the number stored at `key` by the provided float value. If the key does not exist, it is set to 0 before performing the operation.

[[_Redis documentation_]](https://redis.io/commands/incrbyfloat)

---

## incrbyfloat(key, value, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `value`    | double      | Increment value     |
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

Returns a floating point number that contains the updated key value.

## Usage

<<< ./snippets/incrbyfloat-1.js

> Callback response:

```json
38.85841
```
