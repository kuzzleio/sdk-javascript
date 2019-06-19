---
code: false
type: page
title: expireat
description: MemoryStorage:expireat
---

# expireat

Sets an expiration timestamp on a key. After the timestamp has been reached, the key will automatically be deleted.
The `timestamp` parameter accepts an [Epoch time](https://en.wikipedia.org/wiki/Unix_time) value.

[[_Redis documentation_]](https://redis.io/commands/expireat)

---

## expireat(key, timestamp, [options], [callback])

| Arguments   | Type        | Description          |
| ----------- | ----------- | -------------------- |
| `key`       | string      | Key identifier       |
| `timestamp` | int         | Expiration timestamp |
| `options`   | JSON Object | Optional parameters  |
| `callback`  | function    | Callback             |

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

<<< ./snippets/expireat-1.js

> Callback response:

```json
true
```
