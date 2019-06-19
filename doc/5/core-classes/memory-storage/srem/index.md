---
code: false
type: page
title: srem
description: MemoryStorage:srem
---

# srem

Removes members from a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/srem)

---

## srem(key, members, [options], [callback])

| Arguments  | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| `key`      | string      | Key identifier                         |
| `members`  | array       | List of members to remove from the set |
| `options`  | JSON Object | Optional parameters                    |
| `callback` | function    | Callback                               |

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

Returns an integer containing the number of removed elements.

## Usage

<<< ./snippets/srem-1.js

> Callback response:

```json
2
```
