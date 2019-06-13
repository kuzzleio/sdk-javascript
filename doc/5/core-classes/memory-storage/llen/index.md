---
code: false
type: page
title: llen
description: MemoryStorage:llen
---

# llen

Counts the number of items in a list.

[[_Redis documentation_]](https://redis.io/commands/llen)

---

## llen(key, [options], callback)

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

## Callback Response

Returns an integer containing the number of items of a list.

## Usage

<<< ./snippets/llen-1.js

> Callback response:

```json
3
```
