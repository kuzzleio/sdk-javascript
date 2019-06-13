---
code: false
type: page
title: hexists
description: MemoryStorage:hexists
---

# hexists

Checks if a field exists in a hash.

[[_Redis documentation_]](https://redis.io/commands/hexists)

---

## hexists(key, field, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `field`    | string      | Field name          |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

A boolean value specifying if the field exists or not.

## Usage

<<< ./snippets/hexists-1.js

> Callback response:

```json
true
```
