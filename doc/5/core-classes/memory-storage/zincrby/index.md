---
code: false
type: page
title: zincrby
description: MemoryStorage:zincrby
---

# zincrby

Increments the score of a `member` in a sorted set by the provided `value`.

[[_Redis documentation_]](https://redis.io/commands/zincrby)

---

## zincrby(key, member, increment, [options], [callback])

| Arguments   | Type        | Description                 |
| ----------- | ----------- | --------------------------- |
| `key`       | string      | Key identifier              |
| `member`    | string      | Member element to increment |
| `increment` | double      | Increment value             |
| `options`   | JSON Object | Optional parameters         |
| `callback`  | function    | Callback                    |

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

Returns a double containing the updated member's score in the sorted set.

## Usage

<<< ./snippets/zincrby-1.js

> Callback response:

```json
4.14159
```
