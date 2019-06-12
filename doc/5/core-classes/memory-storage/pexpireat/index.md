---
code: false
type: page
title: pexpireat
description: MemoryStorage:pexpireat
---

# pexpireat

Sets an expiration timestamp on a key. After the timestamp has been reached, the key will automatically be deleted.  
The `timestamp` parameter accepts an [Epoch time](https://en.wikipedia.org/wiki/Unix_time) value, in milliseconds.

[[_Redis documentation_]](https://redis.io/commands/pexpireat)

---

## pexpireat(key, timestamp, [options], [callback])

| Arguments   | Type        | Description                                 |
| ----------- | ----------- | ------------------------------------------- |
| `key`       | string      | Key identifier                              |
| `timestamp` | int         | Key's expiration timestamp, in milliseconds |
| `options`   | JSON Object | Optional parameters                         |
| `callback`  | function    | Callback                                    |

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

<<< ./snippets/pexpireat-1.js

> Callback response:

```json
true
```
