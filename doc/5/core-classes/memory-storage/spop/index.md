---
code: false
type: page
title: spop
description: MemoryStorage:spop
---

# spop

Removes and returns one or more elements at random from a set of unique values.

[[_Redis documentation_]](https://redis.io/commands/spop)

---

## spop(key, [options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `count`    | int     | Number of elements to remove      | `1`     |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `MemoryStorage` object to allow chaining.

---

## Callback Response

Returns an array of removed elements.

## Usage

<<< ./snippets/spop-1.js

> Callback response:

```json
["removed element"]
```
