---
code: false
type: page
title: smembers
description: MemoryStorage:smembers
---

# smembers

Returns the members of a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/smembers)

---

## smembers(key, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
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

Returns an array of values held by the provided set.

## Usage

<<< ./snippets/smembers-1.js

> Callback response:

```json
["member1", "member2", "..."]
```
