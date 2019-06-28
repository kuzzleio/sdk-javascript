---
code: false
type: page
title: dbsize
description: MemoryStorage:dbsize
---

# dbsize

Returns the number of keys in the application database.

[[_Redis documentation_]](https://redis.io/commands/dbsize)

---

## dbsize([options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an integer containing the number of keys in the application database.

## Usage

<<< ./snippets/dbsize-1.js

> Callback response:

```json
12
```
