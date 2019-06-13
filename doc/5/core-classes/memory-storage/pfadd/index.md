---
code: false
type: page
title: pfadd
description: MemoryStorage:pfadd
---

# pfadd

Adds elements to an [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) data structure.

[[_Redis documentation_]](https://redis.io/commands/pfadd)

---

## pfadd(key, elements, [options], [callback])

| Arguments  | Type        | Description                                  |
| ---------- | ----------- | -------------------------------------------- |
| `key`      | string      | Key identifier                               |
| `elements` | array       | Elements to add to the HyperLogLog structure |
| `options`  | JSON Object | Optional parameters                          |
| `callback` | function    | Callback                                     |

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

<<< ./snippets/pfadd-1.js

> Callback response:

```json
true
```
