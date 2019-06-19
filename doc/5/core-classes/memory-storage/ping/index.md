---
code: false
type: page
title: ping
description: MemoryStorage:ping
---

# ping

Pings the memory storage database.

[[_Redis documentation_]](https://redis.io/commands/ping)

---

## ping([options], callback)

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

Returns a simple "PONG" string.

## Usage

<<< ./snippets/ping-1.js

> Callback response:

```json
"PONG"
```
