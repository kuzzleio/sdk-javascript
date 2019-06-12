---
code: false
type: page
title: setnx
description: MemoryStorage:setnx
---

# setnx

Sets a value on a key, only if it does not already exist.

[[_Redis documentation_]](https://redis.io/commands/setnx)

---

## setnx(key, value, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `value`    | string      | Value to store      |
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

Returns a boolean specifying if the operation was successful or not.

## Usage

<<< ./snippets/setnx-1.js

> Callback response:

```json
true
```
