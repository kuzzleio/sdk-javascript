---
code: false
type: page
title: hstrlen
description: MemoryStorage:hstrlen
---

# hstrlen

Returns the string length of a field’s value in a hash.

[[_Redis documentation_]](https://redis.io/commands/hstrlen)

---

## hstrlen(key, field, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `field`    | string      | Hash field name     |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns the string length of a field's value.

## Usage

<<< ./snippets/hstrlen-1.js

> Callback response:

```json
3
```
