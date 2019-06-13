---
code: false
type: page
title: expire
description: MemoryStorage:expire
---

# expire

Sets a timeout (in seconds) on a key. After the timeout has expired, the key will automatically be deleted.

[[_Redis documentation_]](https://redis.io/commands/expire)

---

## expire(key, seconds, [options], [callback])

| Arguments  | Type        | Description              |
| ---------- | ----------- | ------------------------ |
| `key`      | string      | Key identifier           |
| `seconds`  | int         | Time to live, in seconds |
| `options`  | JSON Object | Optional parameters      |
| `callback` | function    | Callback                 |

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

Returns a boolean specifying if the operation was successful or not.

## Usage

<<< ./snippets/expire-1.js

> Callback response:

```json
true
```
