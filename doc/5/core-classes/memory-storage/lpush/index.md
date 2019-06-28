---
code: false
type: page
title: lpush
description: MemoryStorage:lpush
---

# lpush

Prepends the specified values to a list. If the key does not exist, it is created holding an empty list before performing the operation.

[[_Redis documentation_]](https://redis.io/commands/lpush)

---

## lpush(key, values, [options], [callback])

| Arguments  | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `key`      | string      | Key identifier                             |
| `values`   | array       | Values to add at the beginning of the list |
| `options`  | JSON Object | Optional parameters                        |
| `callback` | function    | Callback                                   |

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns an integer containing the updated number of items in the list.

## Usage

<<< ./snippets/lpush-1.js

> Callback response:

```json
6
```
