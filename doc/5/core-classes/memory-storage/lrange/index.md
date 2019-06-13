---
code: false
type: page
title: lrange
description: MemoryStorage:lrange
---

# lrange

Returns the list elements between the start and stop positions (inclusive).

[[_Redis documentation_]](https://redis.io/commands/lrange)

---

## lrange(key, start, stop, [options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `key`      | string      | Key identifier      |
| `start`    | int         | Start position      |
| `stop`     | int         | End position        |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an array of retrieved values.

## Usage

<<< ./snippets/lrange-1.js

> Callback response:

```json
["foo", "bar"]
```
