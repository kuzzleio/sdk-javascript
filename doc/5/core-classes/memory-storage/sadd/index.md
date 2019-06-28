---
code: false
type: page
title: sadd
description: MemoryStorage:sadd
---

# sadd

Adds members to a set of unique values stored at `key`. If the `key` does not exist, it is created beforehand.

[[_Redis documentation_]](https://redis.io/commands/sadd)

---

## sadd(key, members, [options], [callback])

| Arguments  | Type        | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| `key`      | string      | Key identifier                              |
| `members`  | array       | Members to add to the list of unique values |
| `options`  | JSON Object | Optional parameters                         |
| `callback` | function    | Callback                                    |

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

Returns an integer containing the number of added elements to the set.

## Usage

<<< ./snippets/sadd-1.js

> Callback response:

```json
6
```
