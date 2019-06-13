---
code: false
type: page
title: hlen
description: MemoryStorage:hlen
---

# hlen

Returns the number of fields contained in a hash.

[[_Redis documentation_]](https://redis.io/commands/hlen)

---

## hlen(key, [options], callback)

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

Returns an integer containing the number of fields in the hash.

## Usage

<<< ./snippets/hlen-1.js

> Callback response:

```json
13
```
