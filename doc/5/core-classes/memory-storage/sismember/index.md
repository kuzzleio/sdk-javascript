---
code: false
type: page
title: sismember
description: MemoryStorage:sismember
---

# sismember

Checks if `member` is a member of the set of unique values stored at `key`.

[[_Redis documentation_]](https://redis.io/commands/sismember)

---

## sismember(key, member, [options], callback)

| Arguments  | Type        | Description                                   |
| ---------- | ----------- | --------------------------------------------- |
| `key`      | string      | Key identifier                                |
| `member`   | string      | Value tested against the set of unique values |
| `options`  | JSON Object | Optional parameters                           |
| `callback` | function    | Callback                                      |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a boolean specifying if `member` is a member of the set or not.

## Usage

<<< ./snippets/sismember-1.js

> Callback response:

```json
true
```
