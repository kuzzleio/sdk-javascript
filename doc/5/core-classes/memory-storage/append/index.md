---
code: false
type: page
title: append
description: MemoryStorage:append
---

# append

Appends a value to a key. If the key does not exist, it is created.

[[_Redis documentation_]](https://redis.io/commands/append)

---

## append(key, value, [options], [callback])

| Arguments  | Type        | Description                |
| ---------- | ----------- | -------------------------- |
| `key`      | string      | Key identifier             |
| `value`    | string      | Value to append to the key |
| `options`  | JSON Object | Optional parameters        |
| `callback` | function    | Callback                   |

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

Return an integer containing the new length of the key's value.

## Usage

<<< ./snippets/append-1.js

> Callback response:

```json
5
```
